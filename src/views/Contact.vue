<!--
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
-->

<template>
  <div class="view">
    <Back />
    <div id="profile">
      <img
        class="icon"
        v-if="pictureStatus"
        :src="`${mediaURL}/${pictureStatus}`"
        :alt="displayName"
      />
      <img class="icon" v-else src="@/assets/logo.svg" :alt="displayName" />
      <h1 id="displayName">{{ displayName }}</h1>
      <div id="statusMessage-box">
        <p id="statusMessage" v-html="statusMessageWithLinesAndEscaped"></p>
      </div>
    </div>
    <div v-if="groupInviting" class="contact-buttons">
      <a title="Accept" href="#" @click.prevent="replyGroupInvitation(true)">
        <div class="contact-button">
          <img class="icon" src="@/assets/icons/accept.svg"  alt="Accept"/>
        </div>
      </a>
      <a title="Reject" href="#" @click.prevent="replyGroupInvitation(false)">
        <div class="contact-button">
          <img class="icon" src="@/assets/icons/reject.svg"  alt="Reject"/>
        </div>
      </a>
    </div>
    <div v-else class="contact-buttons">
      <a title="Chat" href="#" @click.prevent="enterChat">
        <div class="contact-button">
          <img class="icon" src="@/assets/icons/chat.svg"  alt="Chat"/>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

import Back from '@/components/Back.vue';

import lineType from '@/computes/protocol/line_types.js';

export default {
  name: 'Contact',
  components: {
    Back,
  },
  methods: {
    async fetchContactProfile() {
      if (this.targetId === -1) {
        if (!this.$store.state.system.ready) {
          await this.$router.replace({
            name: Constant.ROUTER_TAG.REDIRECT,
            params: {
              next: Constant.ROUTER_TAG.CONTACT,
              data: {targetIdHash: this.targetIdHash},
            },
          });
          return false;
        }
      }
      if (this.targetId.startsWith('u')) {
        const userInfo = await this.$store.state
            .system.instances.idb.user.get(
                Constant.IDB.USER.CONTACT,
                this.targetId,
            );
        this.displayName = userInfo.displayName;
        this.statusMessage = userInfo.statusMessage;
        this.pictureStatus = userInfo.pictureStatus;
        this.contactType = lineType.MIDType.USER;
      } else if (this.targetId.startsWith('c')) {
        const statusMessageArray = [];
        let groupInfo = await this.$store.state
            .system.instances.idb.user.get(
                Constant.IDB.USER.GROUP.JOINED,
                this.targetId,
            );
        if (!groupInfo) {
          groupInfo = await this.$store.state
              .system.instances.idb.user.get(
                  Constant.IDB.USER.GROUP.INVITED,
                  this.targetId,
              );
          this.groupInviting = true;
          statusMessageArray.push(
              `${Constant.GROUP_INVITING_ICON} This is a Group Invitation.\n`,
          );
        }
        const membersCount = groupInfo.members ? groupInfo.members.length : 0;
        const invitesCount = groupInfo.invitee ? groupInfo.invitee.length : 0;
        statusMessageArray.push(
            `Members: ${membersCount}\nInvites: ${invitesCount}`,
        );
        this.displayName = groupInfo.name;
        this.statusMessage = statusMessageArray.join('\n');
        this.pictureStatus = groupInfo.pictureStatus;
        this.contactType = lineType.MIDType.GROUP;
      } else {
        await this.$router.replace({
          name: Constant.ROUTER_TAG.ERROR,
          params: {reason: 'Unknown Contact type.'},
        });
      }
    },
    enterChat() {
      this.$router.replace({
        name: Constant.ROUTER_TAG.CHAT,
        params: {targetIdHash: this.targetIdHash},
      });
    },
    replyGroupInvitation(status) {
      const client = this.$store.state.system.clients.query;
      if (status) {
        client.acceptGroupInvitation(
            Constant.THRIFT_DEFAULT_SEQ,
            this.targetId,
        );
        this.enterChat();
      } else {
        client.rejectGroupInvitation(
            Constant.THRIFT_DEFAULT_SEQ,
            this.targetId,
        );
      }
    },
    escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#039;',
      };

      return text.replace(/[&<>"']/g, function(m) {
        return map[m];
      });
    },
  },
  computed: {
    targetId() {
      if (!this.$store.state.system.ready) {
        return -1;
      }
      if (this.$store.state.system.chatRoomIdHash.has(this.targetIdHash)) {
        return this.$store.state.system.chatRoomIdHash.get(this.targetIdHash);
      }
      this.$router.replace({name: Constant.ROUTER_TAG.NOT_FOUND});
      return '';
    },
    statusMessageWithLinesAndEscaped() {
      return this.escapeHtml(this.statusMessage).replace(/\n/g, '<br />');
    },
  },
  props: ['targetIdHash'],
  data() {
    return {
      contactType: 0,
      groupInviting: false,
      displayName: 'Loading...',
      statusMessage: 'Loading...',
      pictureStatus: null,
      mediaURL: `//${Constant.LINE.MEDIA.HOST}`,
    };
  },
  created() {
    this.fetchContactProfile();
  },
};
</script>

<style scoped>
.view {
  margin: 60px auto;
}

#profile {
  width: 60%;
  min-height: 300px;
  background: rgba(125, 215, 25, 0.1);
  border-radius: 30px;
  padding: 25px;
  text-align: left;
  margin: 0 auto;
}

#profile .icon {
  width: 70px;
  height: 70px;
  border-radius: 70px;
  background: #fff;
}

#profile #displayName {
  margin: 10px;
}

#profile #statusMessage-box {
  max-width: 100%;
  height: 150px;
  overflow: scroll;
}

.contact-buttons {
  display: flex;
  justify-content: center;
  width: 60%;
  height: 60px;
  margin: 10px auto;
}

.contact-button {
  width: 35px;
  height: 35px;
  margin: 10px;
  padding: 15px;
  border: 1px solid #999;
  border-radius: 60px;
  background: rgba(0, 0, 0, 0);
}

.contact-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.contact-button:active {
  color: rgb(255, 255, 255);
  background: rgba(150, 155, 150, 0.5);
}

@media screen and (max-width: 780px) {
  #profile {
    text-align: center;
  }
}
</style>
