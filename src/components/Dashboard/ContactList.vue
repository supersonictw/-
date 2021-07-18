<!--
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
-->

<template>
  <div id="contact-list">
    <div id="contact-list-type">
      <a
        v-for="(item, itemId) in contactType"
        :key="itemId"
        :id="itemId"
        :class="getTabColor(itemId)"
        @click.prevent="switchTab"
        href="#"
        >{{ item }}</a
      >
    </div>
    <div
      class="contact-item"
      v-for="(item, itemId) in getTabData()"
      :key="itemId"
    >
      <a
        :title="getItemTitle(item)"
        @click.prevent="enterContact(item.id)"
        href="#"
      >
        <div class="contact">
          <img
            class="picture-icon"
            v-if="item.pictureStatus"
            :src="`${mediaURL}/${item.pictureStatus}`"
          />
          <img class="picture-icon" v-else src="@/assets/logo.svg" />
          <div class="row-box">
            <h3 class="text-box">{{ item.displayName }}</h3>
            <p class="text-box">{{ item.statusMessage }}</p>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

import hash from 'js-sha256';

export default {
  name: 'ContactList',
  methods: {
    enterContact(chatId) {
      this.$router.push({
        name: Constant.ROUTER_TAG.CONTACT,
        params: {targetIdHash: chatId},
      });
    },
    async waitForFetchData() {
      setTimeout(() => {
        if (this.$store.state.system.ready) {
          this.fetchContacts();
          this.fetchGroupsJoined();
          this.fetchGroupsInvited();
        } else {
          this.waitForFetchData();
        }
      }, Constant.TIMEOUT.RETRY);
    },
    async fetchContacts() {
      let cursor = await this.$store.state.system
          .instances.idb.user
          .transaction(Constant.IDB.USER.CONTACT)
          .store.index('displayName')
          .openCursor();
      while (cursor) {
        this.contactUser.push({
          id: hash.sha256(cursor.value.mid),
          displayName: cursor.value.displayName,
          statusMessage: cursor.value.statusMessage,
          pictureStatus: cursor.value.pictureStatus,
        });
        cursor = await cursor.continue();
      }
    },
    layoutGroupStatus(groupData, invited = false) {
      const layout = [];
      // Invited Icon
      if (invited) layout.push(`${Constant.GROUP_INVITING_ICON}`);
      // Members Count
      const membersCount = groupData.members ? groupData.members.length : 0;
      layout.push(`Members: ${membersCount}`);
      return layout.join(' ');
    },
    async fetchGroupsJoined() {
      let cursor = await this.$store.state.system
          .instances.idb.user
          .transaction(Constant.IDB.USER.GROUP.JOINED)
          .store.index('displayName')
          .openCursor();
      while (cursor) {
        this.contactGroupJoined.push({
          id: hash.sha256(cursor.value.id),
          displayName: cursor.value.name,
          statusMessage: this.layoutGroupStatus(cursor.value),
          pictureStatus: cursor.value.pictureStatus,
        });
        cursor = await cursor.continue();
      }
    },
    async fetchGroupsInvited() {
      let cursor = await this.$store.state.system
          .instances.idb.user
          .transaction(Constant.IDB.USER.GROUP.INVITED)
          .store.index('displayName')
          .openCursor();
      while (cursor) {
        this.contactGroupInvited.push({
          id: hash.sha256(cursor.value.id),
          displayName: cursor.value.name,
          statusMessage: this.layoutGroupStatus(cursor.value),
          pictureStatus: cursor.value.pictureStatus,
        });
        cursor = await cursor.continue();
      }
    },
    getTabData() {
      if (!this.$store.state.system.ready) return;
      switch (this.tabId) {
        case 0:
          return this.contactUser;
        case 1:
          return this.contactGroup;
        default:
          this.$router.replace({name: Constant.ROUTER_TAG.NOT_FOUND});
      }
    },
    getTabColor(e) {
      return this.tabId === e ? 'actived' : '';
    },
    switchTab(e) {
      const tabId = parseInt(e.target.id);
      const data = [this.contactUser, this.contactGroup];
      if (tabId >= data.length || tabId < 0) {
        this.$router.replace({name: Constant.ROUTER_TAG.NOT_FOUND});
      }
      this.tabId = tabId;
    },
    getItemTitle(item) {
      if (this.tabId === 1) {
        return item.statusMessage.includes(Constant.GROUP_INVITING_ICON) ?
          `[Inviting] ${item.displayName}` :
          `${item.displayName}`;
      }
      return item.displayName;
    },
  },
  computed: {
    contactGroup() {
      return [].concat(this.contactGroupJoined, this.contactGroupInvited);
    },
  },
  data() {
    return {
      tabId: 0,
      contactType: ['Contact', 'Group'],
      mediaURL: `//${Constant.LINE.MEDIA.HOST}`,
      contactUser: [],
      contactGroupJoined: [],
      contactGroupInvited: [],
    };
  },
  mounted() {
    this.waitForFetchData();
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}

#contact-list {
  margin: 10px 10px 10px 10px;
  width: 250px;
  height: 500px;
  display: block;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 0 20px 10px 20px;
  overflow: scroll;
}

#contact-list-type {
  position: sticky;
  top: 0;
  background: #fff;
  padding: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

#contact-list-type a {
  padding: 5px 7px 5px 7px;
  margin: 0 10px 0 10px;
  border-radius: 10px;
}

#contact-list-type a:hover,
#contact-list-type .actived {
  color: #fff;
  background-color: #33cc55;
}

.contact-item {
  text-align: left;
  margin: 10px 0 10px 0;
}

.contact {
  display: flex;
  width: auto;
  height: 50px;
  color: rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.contact .picture-icon {
  width: 50px;
  height: 50px;
  border-radius: 50px;
  margin-right: 10px;
}

.row-box {
  width: 76%;
  height: auto;
}

.text-box {
  width: auto;
  height: 20px !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.contact h3 {
  width: auto;
  height: 18px;
  font-size: 15px;
  margin: 5px auto;
}

.contact p {
  width: auto;
  height: 15px;
  font-size: 12px;
  margin: 5px auto;
}

@media screen and (max-width: 780px) {
  #contact-list {
    height: 350px;
  }

  .row-box {
    width: 70%;
    height: auto;
  }
}
</style>
