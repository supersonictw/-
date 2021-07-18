<!--
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
-->

<template>
  <div id="chat-list">
    <div
      class="chat-item"
      v-for="(item, itemId) in getDisplayMessages"
      :key="itemId"
    >
      <div class="contact" @click.prevent="enterChat(item.id)">
        <img
          class="picture-icon"
          v-if="item.pictureStatus"
          :src="`${mediaURL}/${item.pictureStatus}`"
        />
        <img class="picture-icon" v-else src="@/assets/logo.svg" />
        <div class="row-box">
          <h3 class="text-box">{{ item.displayName }}</h3>
          <p class="text-box">{{ item.lastMessage }}</p>
        </div>
        <div class="info-box">
          <p>{{ timeToReadable(item.time) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

import hash from 'js-sha256';
import moment from 'moment';

import lineType from '@/computes/protocol/line_types.js';

export default {
  name: 'ChatList',
  methods: {
    enterChat(chatId) {
      this.$router.push({
        name: Constant.ROUTER_TAG.CHAT,
        params: {targetIdHash: chatId},
      });
    },
    async getContactInfo(message) {
      if (!this.$store.state.system.ready) return;
      switch (message.toType) {
        case lineType.MIDType.USER: {
          const targetId =
            message.from_ === this.$store.state.system.profile.userId ?
              message.to :
              message.from_;
          let contactData = await this.$store.state.system.instances
              .idb.user.get(
                  Constant.IDB.USER.CONTACT,
                  targetId,
              );
          if (!contactData) {
            contactData = {};
            contactData.displayName = 'Unknown';
          }
          return contactData;
        }
        case lineType.MIDType.GROUP: {
          let groupData = await this.$store.state.system.instances
              .idb.user.get(
                  Constant.IDB.USER.GROUP.JOINED,
                  message.to,
              );
          if (!groupData) {
            groupData = {};
            groupData.displayName = 'Unknown';
          } else {
            groupData.displayName = groupData.name;
            delete groupData.name;
          }
          return groupData;
        }
        default:
          console.error(
              'Unknown toType in getContactInfo with ' + message.toType,
          );
      }
    },
    async waitForFetchDisplayMessage() {
      setTimeout(() => {
        if (this.$store.state.system.ready) {
          this.fetchDisplayMessage();
        } else {
          this.waitForFetchDisplayMessage();
        }
      }, Constant.TIMEOUT.RETRY);
    },
    async fetchDisplayMessage() {
      let cursor = await this.$store.state.system
          .instances.idb.user
          .transaction(Constant.IDB.USER.PREVIEW_MESSAGE_BOX)
          .store.openCursor();
      while (cursor) {
        await this.updateDisplayMessage(cursor.value);
        cursor = await cursor.continue();
      }
      await this.fetchDisplayMessage();
    },
    async updateDisplayMessage(message) {
      const contactData = await this.getContactInfo(message);
      const displayName = contactData ? contactData.displayName : null;
      const pictureStatus = contactData ? contactData.pictureStatus : null;
      const targetIdHash = hash.sha256(message.target);
      const lastMessage = (function(obj) {
        switch (obj.contentType) {
          case lineType.ContentType.IMAGE:
            return '(Image)';
          case lineType.ContentType.STICKER:
            return '(Sticker)';
          default:
            return obj.text;
        }
      })(message);
      if (
        message.target in this.previewMessageBox &&
        parseInt(message.createdTime) <
          parseInt(this.previewMessageBox[message.target].time)
      ) {
        return;
      }
      this.$set(this.previewMessageBox, message.target, {
        id: targetIdHash,
        time: parseInt(message.createdTime),
        displayName,
        pictureStatus,
        lastMessage,
      });
    },
    timeToReadable(timeValue) {
      const nowValue = +new Date();
      const dateTime = moment(timeValue);
      if (timeValue - nowValue < 86400) return dateTime.format('hh:mm');
      return dateTime.format('YYYY/MM/DD');
    },
  },
  computed: {
    getDisplayMessages() {
      const data = Object.values(this.previewMessageBox);
      data.sort((a, b) => b.time > a.time);
      return data;
    },
  },
  data() {
    return {
      previewMessageBox: {},
      mediaURL: `//${Constant.LINE.MEDIA.HOST}`,
    };
  },
  mounted() {
    this.waitForFetchDisplayMessage();
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}

#chat-list {
  margin: 10px;
  width: 75%;
  height: 510px;
  padding: 5px 0;
  display: block;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: scroll;
}

.chat-item {
  text-align: left;
  padding: 10px 20px;
}

.contact {
  display: flex;
  justify-content: space-between;
  width: auto;
  height: 50px;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}

.contact .picture-icon {
  width: 50px;
  height: 50px;
  border-radius: 50px;
  margin-right: 10px;
  flex-shrink: 1;
}

.row-box {
  width: 80%;
  height: auto;
  flex-grow: 1;
}

.info-box {
  text-align: right;
}

.text-box {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.contact h3 {
  width: auto;
  height: 30px;
  font-size: 20px;
  margin: 0;
}

.contact p {
  width: auto;
  height: 15px;
  font-size: 12px;
  margin: 0;
}

@media screen and (max-width: 780px) {
  #chat-list {
    width: 95%;
    height: 370px;
  }

  .chat-item {
    padding: 10px 10px;
  }

  .row-box {
    width: 50%;
    height: auto;
  }
}
</style>
