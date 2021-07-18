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
    <div id="chat">
      <div class="header">
        <img
          class="picture-icon"
          v-if="chatRoomPicture"
          :src="`${mediaURL}/${chatRoomPicture}`"
        />
        <img class="picture-icon" v-else src="@/assets/logo.svg" />
        <div class="row-box">
          <h2 class="text-box">{{ chatRoomTitle }}</h2>
        </div>
      </div>
      <div id="msg-container">
        <div
          :class="`${configureMsgBox(0, item)} msg-box`"
          v-for="(item, itemId) in getMessages"
          :key="itemId"
        >
          <div v-if="configureMsgBox(1, item)" class="contact">
            <img
              class="picture-icon"
              v-if="getUserInfo(item.origin).pictureStatus"
              :src="`${mediaURL}/${getUserInfo(item.origin).pictureStatus}`"
            />
            <img class="picture-icon" v-else src="@/assets/logo.svg" />
            <h3 v-if="item.origin !== getMyUserId" class="name">
              {{ getUserInfo(item.origin).displayName }}
            </h3>
          </div>
          <div :class="`${configureMsgBox(2, item)} content`">
            <p v-if="item.type === 1">
              <a
                title="View full image"
                href="#"
                @click.prevent="viewFullImage(item.id)"
              >
                <img :src="mediaObjects[item.id]" />
              </a>
            </p>
            <p v-else-if="item.type === 7">
              <img :src="mediaObjects[item.id]" />
            </p>
            <p v-else v-html="item.content"></p>
            <p class="date">{{ timeToReadable(item.time) }}</p>
          </div>
        </div>
      </div>
      <div id="msg-input-box">
        <a
          id="emoji-box-opener"
          title="Emoji"
          href="#"
          @click.prevent="showEmojiBox"
        >
          <div class="icon">
            <img alt="Emoji" src="@/assets/icons/emoji.svg" />
          </div>
        </a>
        <VEmojiPicker
          v-show="showEmojiBoxCheckpoint"
          id="emoji-box"
          @select="addEmoji"
        />
        <div class="dropdown">
          <div title="Attach" class="icon">
            <img alt="Attach" src="@/assets/icons/append.svg" />
          </div>
          <div class="dropdown-content">
            <a id="text" title="Text" href="#" @click.prevent="updateInputType">
              <img
                class="dropdown-content-icon"
                alt="Text"
                src="@/assets/icons/text.svg"
              />Text
            </a>
            <a
              id="image"
              title="Image"
              href="#"
              @click.prevent="updateInputType"
            >
              <img
                class="dropdown-content-icon"
                alt="Image"
                src="@/assets/icons/image.svg"
              />Image
            </a>
          </div>
        </div>
        <textarea
          v-show="inputType === 0"
          class="msg-input msg-input-text"
          v-model="inputText"
          @keydown.enter.exact="sendMessage"
        />
        <input
          v-show="inputType === 1"
          ref="file"
          type="file"
          id="file-upload"
          class="msg-input msg-input-div"
          :disabled="checkUploadBox"
        />
        <a
          title="Send"
          href="#"
          @click.prevent="sendMessage"
          :disabled="checkUploadBox"
        >
          <div class="icon">
            <img alt="Send" src="@/assets/icons/send.svg" />
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

import Back from '@/components/Back.vue';

import axios from 'axios';
import moment from 'moment';
import VEmojiPicker from 'v-emoji-picker';

import lineType from '@/computes/protocol/line_types.js';

export default {
  name: 'Chat',
  components: {
    Back,
    VEmojiPicker,
  },
  methods: {
    async fetchChatRoomInformation() {
      if (this.targetId === -1) {
        if (!this.$store.state.system.ready) {
          await this.$router.replace({
            name: Constant.ROUTER_TAG.REDIRECT,
            params: {
              next: Constant.ROUTER_TAG.CHAT,
              data: {targetIdHash: this.targetIdHash},
            },
          });
          return false;
        }
      }
      if (this.targetId.startsWith('u')) {
        this.chatRoomInfo = await this.$store.state.system
            .instances.idb.user.get(
                Constant.IDB.USER.CONTACT,
                this.targetId,
            );
        this.chatRoomTitle = this.chatRoomInfo.displayName;
        this.chatRoomPicture = this.chatRoomInfo.pictureStatus;
        this.chatRoomType = lineType.MIDType.USER;
        return true;
      } else if (this.targetId.startsWith('c')) {
        this.chatRoomInfo = await this.$store.state.system
            .instances.idb.user.get(
                Constant.IDB.USER.GROUP.JOINED,
                this.targetId,
            );
        this.chatRoomTitle = this.chatRoomInfo.name;
        this.chatRoomPicture = this.chatRoomInfo.pictureStatus;
        this.chatRoomType = lineType.MIDType.GROUP;
        return true;
      }
      await this.$router.replace({
        name: Constant.ROUTER_TAG.ERROR,
        params: {reason: 'Unknown Chat Room type.'},
      });
    },
    configureMsgBox(queryType, message) {
      switch (queryType) {
        case 0:
          return message.origin === this.getMyUserId ? 'self' : 'another';
        case 1:
          return (
            message.origin !== this.getMyUserId &&
            this.chatRoomType !== lineType.MIDType.USER
          );
        case 2:
          return this.chatRoomType === lineType.MIDType.USER ?
            'content-contact' :
            '';
      }
    },
    async fetchDisplayMessage() {
      if (!this.$store.state.system.ready) {
        setTimeout(this.fetchDisplayMessage, Constant.TIMEOUT.RETRY);
      }
      let cursor = await this.$store.state
          .system.instances.idb.user
          .transaction(Constant.IDB.USER.MESSAGE_BOX)
          .store.index('target')
          .openCursor(IDBKeyRange.only(this.targetId), 'prev');
      while (cursor) {
        if (this.messages.length > Constant.CHAT_DISPLAY_ROW_LIMIT) {
          this.messages.shift();
        }
        if (!this.initialized) {
          if (this.initialized === null) {
            this.messageIdLastSeen = cursor.value.id;
            this.sendReadTag(cursor.value.id);
            this.initialized = false;
          }
          this.messages.splice(0, 0, cursor.value);
          this.moveToBottom(true);
        } else if (cursor.value.id > this.messageIdLastSeen) {
          this.messages.push(cursor.value);
          this.messageIdLastSeen = cursor.value.id;
          this.sendReadTag(cursor.value.id);
          this.moveToBottom(true);
        }
        cursor = await cursor.continue();
      }
      this.initialized = true;
      await this.fetchDisplayMessage();
    },
    downloadImage(imageSource) {
      return axios(imageSource, {
        method: 'GET',
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'image/jpeg',
          'X-Line-Access': this.$store.state.authToken,
          'X-Line-Application': Constant.LINE.APPLICATION_IDENTITY,
        },
      });
    },
    async getStickerImageResource(messageId, contentMetadata) {
      if (messageId in this.mediaObjects) return;
      const version =
        Math.floor(contentMetadata.STKVER / 1000000) +
        '/' +
        Math.floor(contentMetadata.STKVER / 1000) +
        '/' +
        (contentMetadata.STKVER % 1000);
      const platform = Constant.LINE.STICKER.PLATFORM;
      const packageId = contentMetadata.STKPKGID.toString();
      const stickerId = contentMetadata.STKID.toString();
      const domain = Constant.LINE.STICKER.HOST;
      const path = `/products/${version}/${packageId}/${platform}/stickers/`;
      const stickerFileName = `${stickerId}.png`;
      const stickerURL = `//${domain}${path}${stickerFileName}`;
      this.$set(this.mediaObjects, messageId, stickerURL);
    },
    async getImageResource(messageId, messageOrigin) {
      if (!messageId || messageId in this.mediaObjects) return;
      if (this.getMyUserId === messageOrigin && this.checkUploadBox) {
        return setTimeout(
            (messageId, messageOrigin) =>
              this.getImageResource(messageId, messageOrigin),
            Constant.TIMEOUT.RETRY,
        );
      }
      const imageURL = `${this.mediaURL}/os/m/${messageId}/preview`;
      const imageXHR = await this.downloadImage(imageURL);
      const imageB64 =
        'data:image/jpeg;base64,' +
        Buffer.from(imageXHR.data).toString('base64');
      this.$set(this.mediaObjects, messageId, imageB64);
    },
    showEmojiBox() {
      this.showEmojiBoxCheckpoint = !this.showEmojiBoxCheckpoint;
    },
    updateInputType(e) {
      switch (e.target.id) {
        case 'text':
          this.inputType = 0;
          break;
        case 'image':
          this.inputType = 1;
          break;
      }
    },
    addEmoji(emoji) {
      this.inputText += emoji.data;
    },
    sendMessage() {
      this.moveToBottom();
      if (this.inputType === 0 && this.inputText.length < 1) return;
      this.sendMessageProcess(
          this.inputType,
          this.inputText,
          this.$refs.file.files,
      );
      setTimeout(() => (this.inputText = ''), Constant.TIMEOUT.WAIT);
    },
    async sendMessageProcess(inputType, inputText, fileList) {
      let message;
      switch (inputType) {
        case 0:
          message = new lineType.Message({
            to: this.targetId,
            type: lineType.ContentType.NONE,
            text: inputText,
          });
          break;
        case 1:
          if (
            fileList.length !== 1 ||
            this.checkFileTypeForSendMessage(fileList[0].type) === -1
          ) {
            break;
          }
          message = new lineType.Message({
            to: this.targetId,
            contentType: this.checkFileTypeForSendMessage(fileList[0].type),
            text: null,
            contentPreview: null,
            contentMetadata: {
              FILE_NAME: fileList[0].name,
              FILE_SIZE: fileList[0].size.toString(),
            },
          });
          break;
      }
      if (!message) {
        await this.$router.replace({
          name: Constant.ROUTER_TAG.ERROR,
          params: {reason: 'Something was wrong while send a message'},
        });
        return;
      }
      const response = await this.$store.state.system.clients.query.sendMessage(
          Constant.THRIFT_DEFAULT_SEQ,
          message,
      );
      if (inputType === 1) {
        await this.uploadMessageAttached(response.id, fileList);
      }
    },
    async uploadMessageAttached(messageId, fileList) {
      if (fileList.length !== 1) return;
      const data = new FormData();
      data.append(
          'params',
          JSON.stringify({
            ver: '1.0',
            oid: messageId,
            size: fileList[0].size,
            name: fileList[0].name,
            type: Object.keys(lineType.ContentType)
                .find(
                    (key) =>
                      lineType.ContentType[key] ===
                this.checkFileTypeForSendMessage(fileList[0].type),
                )
                .toLowerCase(),
          }),
      );
      data.append('file', fileList[0]);
      await axios(`${this.mediaURL}/talk/m/upload.nhn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Line-Access': this.$store.state.authToken,
          'X-Line-Application': Constant.LINE.APPLICATION_IDENTITY,
        },
        data,
      });
      this.$refs.file.value = null;
    },
    checkFileTypeForSendMessage(mime) {
      switch (mime) {
        case 'image/png':
        case 'image/jpeg':
          return lineType.ContentType.IMAGE;
        case 'image/mpeg4':
          return lineType.ContentType.VIDEO;
        default:
          return -1;
      }
    },
    getUserInfo(userId) {
      switch (this.chatRoomType) {
        case lineType.MIDType.USER:
          return this.chatRoomInfo;
        case lineType.MIDType.GROUP:
          return this.chatRoomInfo.members.find((user) => user.mid === userId);
        default:
          this.$router.replace({
            name: Constant.ROUTER_TAG.ERROR,
            params: {reason: 'Contact Metadata not synchronized completely.'},
          });
      }
    },
    sendReadTag(messageId) {
      this.$store.state.system.clients.query.sendChatChecked(
          Constant.THRIFT_DEFAULT_SEQ,
          this.targetId,
          messageId,
      );
    },
    moveToBottom(autoScroll = false) {
      const element = document.getElementById('msg-container');
      if (element) {
        if (
          autoScroll &&
          element.scrollTop + element.clientHeight === element.scrollHeight
        ) {
          setTimeout(this.moveToBottom, Constant.TIMEOUT.WAIT);
        } else {
          element.scroll(0, element.scrollHeight);
        }
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
    timeToReadable(uint8arrayTime) {
      const timeValue = parseInt(uint8arrayTime.toString());
      const nowValue = +new Date();
      const dateTime = moment(timeValue);
      if (timeValue - nowValue < 86400) return dateTime.format('hh:mm');
      return dateTime.format('YYYY/MM/DD');
    },
    viewFullImage(messageId) {
      this.$router.push({
        name: Constant.ROUTER_TAG.PICTURE_PREVIEW,
        params: {messageId},
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
    getMessages() {
      const layout = [];
      this.messages.forEach((message) => {
        let layoutType = lineType.ContentType.NONE;
        let layoutMessage = '';
        switch (message.contentType) {
          case lineType.ContentType.IMAGE:
            this.getImageResource(message.id, message.from_);
            layoutType = lineType.ContentType.IMAGE;
            break;
          case lineType.ContentType.STICKER:
            this.getStickerImageResource(message.id, message.contentMetadata);
            layoutType = lineType.ContentType.STICKER;
            break;
          default:
            layoutMessage = message.text ?
              message.text :
              '[Couldn\'t display the message on XIA.]';
        }
        layout.push({
          id: message.id,
          type: layoutType,
          origin: message.from_,
          content: this.escapeHtml(layoutMessage).replace(/\n/g, '<br />'),
          time: message.createdTime,
        });
      });
      return layout;
    },
    getMyUserId() {
      return this.$store.state.system.profile.userId;
    },
    checkUploadBox() {
      if (this.$refs.file === undefined) return;
      return !!this.$refs.file.value;
    },
  },
  props: ['targetIdHash'],
  data() {
    return {
      initialized: null,
      chatRoomTitle: 'Unknown',
      chatRoomPicture: null,
      chatRoomType: 0,
      chatRoomInfo: {},
      inputType: 0,
      inputText: '',
      messages: [],
      mediaObjects: {},
      messageIdLastSeen: null,
      showEmojiBoxCheckpoint: false,
      mediaURL: `//${Constant.LINE.MEDIA.HOST}`,
    };
  },
  async mounted() {
    if (await this.fetchChatRoomInformation()) {
      await this.fetchDisplayMessage();
    }
  },
};
</script>

<style scoped>
.view {
  margin: 60px auto;
}

#chat {
  width: 90%;
  min-width: 300px;
  margin: 0 auto;
}

.header {
  height: 60px;
  display: flex;
  text-align: left;
  margin-top: 10px;
}

.header h2 {
  margin-left: 10px;
}

#msg-container {
  min-width: 100px;
  height: 500px;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  margin: 10px auto;
  padding: 10px;
  overflow-x: hidden;
  overflow-y: scroll;
}

#msg-container .self {
  text-align: right;
}

#msg-container .self .content {
  padding-left: 20%;
}

#msg-container .another {
  text-align: left;
}

#msg-container .another .content {
  padding-right: 20%;
}

.row-box {
  width: 75%;
  height: auto;
}

.text-box {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.picture-icon {
  width: 50px;
  height: 50px;
  border-radius: 50px;
  margin: 5px;
}

.msg-box {
  margin-bottom: 25px;
}

.contact h3 {
  margin: 0;
  margin-left: 65px;
}

.contact .picture-icon {
  float: left;
}

.content {
  width: auto;
  height: auto;
  margin-left: 60px;
}

.content-contact {
  margin-left: 0px;
}

.content p {
  margin: 5px;
  overflow-wrap: anywhere;
}

.content img {
  max-width: 30%;
  max-height: 300px;
  overflow: hidden;
}

.date {
  font-size: 12px;
}

#msg-input-box {
  display: inline-flex;
  width: 70%;
  min-height: 60px;
  margin: 0 auto;
}

#emoji-box,
#emoji-box-opener {
  margin-right: 1%;
}

.msg-input {
  width: 89%;
  height: 70px;
  margin-left: 1%;
  margin-right: 1%;
}

.msg-input-text {
  font-size: 15px;
  resize: none;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}

.msg-input-div {
  text-align: center;
  margin: 15px auto;
}

#file-upload {
  width: 30%;
  height: auto;
}

.icon {
  width: 50px;
  height: 50px;
  padding: 10px;
  cursor: pointer;
  border: 1px solid #999;
  border-radius: 50px;
  background: rgba(0, 0, 0, 0);
}

.icon:hover {
  background: rgba(0, 0, 0, 0.3);
}

.icon:active {
  color: rgb(255, 255, 255);
  background: rgba(0, 0, 0, 0.1);
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  text-align: left;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 100px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 10px;
  text-decoration: none;
  border-radius: 10px;
  display: block;
}

.dropdown-content-icon {
  width: auto;
  height: 15px;
  margin-right: 10px;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown:hover .icon {
  background-color: rgba(0, 0, 0, 0.1);
}

@media screen and (max-width: 780px) {
  #msg-input-box {
    width: 100%;
  }

  #emoji-box,
  #emoji-box-opener {
    display: none;
  }
}
</style>
