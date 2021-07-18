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
    <div id="create">
      <div
        v-show="!mobileUI || (mobileUI && !displayContactValue)"
        class="card"
      >
        <div id="header">
          <div v-if="setPictureAbled">
            <img
              v-if="createPicture"
              class="picture-icon selected"
              :src="createPicture"
              @click="displayUploadAndCorpImage"
            />
            <img
              v-else
              class="picture-icon"
              src="@/assets/logo.svg"
              @click="displayUploadAndCorpImage"
            />
            <imageUpload
              field="img"
              langType="en"
              v-model="uploading"
              @crop-success="cropSuccess"
            />
          </div>
          <input
            id="create-name"
            type="text"
            maxlength="20"
            placeholder="Name"
            v-model="createName"
            required
          />
        </div>
        <div id="body">
          <a
            v-for="(item, itemId) in selected"
            :key="itemId"
            href="#"
            @click.prevent="selectContact(item)"
          >
            <img
              v-if="pictures.get(item)"
              class="picture-icon selected"
              :src="`${mediaURL}/${pictures.get(item)}`"
            />
            <img v-else class="picture-icon" src="@/assets/logo.svg" />
          </a>
          <a href="#" @click.prevent="displayContact">
            <img class="picture-icon" src="@/assets/icons/append.svg" />
          </a>
        </div>
        <div id="footer">
          <input
            type="submit"
            id="submit"
            value="Create"
            @click.prevent="create"
            :disabled="created"
          />
        </div>
      </div>
      <div v-show="displayContactValue" class="card" id="contact-box">
        <div id="contact-list-filter">
          <input
            id="filter-name"
            type="text"
            maxlength="20"
            placeholder="Search"
            v-model="filterName"
          />
        </div>
        <div id="contact-list">
          <div
            class="contact-item"
            v-for="(item, itemId) in displayList"
            :key="itemId"
          >
            <a
              :title="item.displayName"
              href="#"
              @click.prevent="selectContact(item.mid)"
            >
              <div class="contact">
                <img
                  v-if="item.pictureStatus"
                  class="picture-icon"
                  :src="`${mediaURL}/${item.pictureStatus}`"
                />
                <img v-else class="picture-icon" src="@/assets/logo.svg" />
                <div class="row-box">
                  <h3 class="text-box">{{ item.displayName }}</h3>
                  <p class="text-box">{{ item.statusMessage }}</p>
                </div>
                <img
                  v-if="checkSelected(item.mid)"
                  class="picture-icon"
                  src="@/assets/icons/accept.svg"
                />
              </div>
            </a>
          </div>
        </div>
        <div v-if="mobileUI" id="contact-list-footer">
          <a href="#" @click.prevent="displayContact">
            <img class="picture-icon" src="@/assets/icons/append.svg" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

import Back from '@/components/Back.vue';

import axios from 'axios';
import hash from 'js-sha256';
import imageUpload from 'vue-image-crop-upload';

import lineType from '@/computes/protocol/line_types.js';

export default {
  name: 'Create',
  components: {
    Back,
    imageUpload,
  },
  methods: {
    async waitForFetchData() {
      setTimeout(() => {
        if (this.$store.state.system.ready) {
          this.fetchContacts();
        } else {
          this.waitForFetchData();
        }
      }, Constant.TIMEOUT.RETRY);
    },
    async fetchContacts() {
      let cursor = await this.$store.state
          .system.instances.idb.user
          .transaction(Constant.IDB.USER.CONTACT)
          .store.index('displayName')
          .openCursor();
      while (cursor) {
        this.contacts.push(cursor.value);
        cursor = await cursor.continue();
      }
    },
    displayUploadAndCorpImage() {
      this.uploading = !this.uploading;
    },
    cropSuccess(picture) {
      this.createPicture = picture;
    },
    displayContact() {
      this.displayContactValue = !this.displayContactValue;
    },
    selectContact(userId) {
      const index = this.selected.indexOf(userId);
      if (index < 0) {
        this.selected.push(userId);
        this.moveToBottom();
      } else {
        this.selected.splice(index, 1);
      }
    },
    checkSelected(userId) {
      return this.selected.includes(userId);
    },
    moveToBottom() {
      const element = document.getElementById('body');
      if (element) element.scroll(0, element.scrollHeight);
    },
    async create() {
      if (this.createType > 0 && this.createName.length > 0) {
        this.created = true;
        const client = this.$store.state.system.clients.query;
        switch (this.createType) {
          case lineType.MIDType.GROUP: {
            const group = await client.createGroup(
                Constant.THRIFT_DEFAULT_SEQ,
                this.createName,
                this.selected,
            );
            if (group) {
              if (this.createPicture) await this.uploadPicture(group.id);
              setTimeout(
                  () =>
                    this.$router.push({
                      name: Constant.ROUTER_TAG.CHAT,
                      params: {targetIdHash: hash.sha256(group.id)},
                    }),
                  Constant.TIMEOUT.WAIT,
              );
            } else {
              this.$router.replace({
                name: Constant.ROUTER_TAG.ERROR,
                params: {reason: 'Error occurred while creating a group.'},
              });
            }
            break;
          }
        }
      }
    },
    async uploadPicture(targetId) {
      const data = new FormData();
      const filename = Date.now().toString();
      const picture = this.b64StringToFileObject(this.createPicture, filename);
      data.append(
          'params',
          JSON.stringify({
            ver: '1.0',
            type: 'image',
            oid: targetId,
            name: picture.name,
            size: picture.size,
          }),
      );
      data.append('file', picture);
      await axios(`${this.mediaURL}/talk/g/upload.nhn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Line-Access': this.$store.state.authToken,
          'X-Line-Application': Constant.LINE.APPLICATION_IDENTITY,
        },
        data,
      });
      return true;
    },
    b64StringToFileObject(b64String, filename) {
      const arr = b64String.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type: mime});
    },
    async mobileDetector(e) {
      this.mobileUI = e.target.innerWidth < Constant.MOBILE_UI_WIDTH;
    },
  },
  computed: {
    displayList() {
      return this.contacts.filter((obj) => {
        const item = obj.displayName.toLowerCase();
        return item.includes(this.filterName.toLowerCase());
      });
    },
    setPictureAbled() {
      return this.createType == lineType.MIDType.GROUP;
    },
    pictures() {
      const layout = new Map();
      this.contacts.forEach((obj) => layout.set(obj.mid, obj.pictureStatus));
      return layout;
    },
  },
  props: ['type'],
  data() {
    return {
      created: false,
      uploading: false,
      createType: -1,
      createName: '',
      createPicture: '',
      contacts: [],
      selected: [],
      filterName: '',
      displayContactValue: false,
      mediaURL: `//${Constant.LINE.MEDIA.HOST}`,
      mobileUI: window.innerWidth < Constant.MOBILE_UI_WIDTH,
    };
  },
  created() {
    window.addEventListener('resize', this.mobileDetector);
  },
  mounted() {
    if (this.type) {
      switch (this.type) {
        case 'group':
          this.createType = lineType.MIDType.GROUP;
          break;
      }
    } else {
      this.$router.replace({
        name: Constant.ROUTER_TAG.ERROR,
        params: {reason: 'Unknown CreateType.'},
      });
      return;
    }
    this.waitForFetchData();
  },
  destroyed() {
    window.removeEventListener('resize', this.mobileDetector);
  },
};
</script>

<style scoped>
.view {
  margin: 60px auto;
}

a {
  text-decoration: none;
}

#create {
  display: flex;
  text-align: left;
  justify-content: center;
  width: 800px;
  margin: 10px auto;
}

.card {
  width: 350px;
  height: auto;
  margin: 0 10px;
  padding: 25px;
  border: 1px solid;
  border-radius: 10px;
}

#header {
  display: flex;
  width: 300px;
  height: 65px;
  margin: 10px;
  margin-bottom: 30px;
}

#body {
  width: 300px;
  height: 350px;
  margin: 0 auto;
  overflow: scroll;
}

#create-name {
  width: 200px;
  height: 55px;
  font-size: 22px;
  margin-left: 10px;
  border: none;
  border-bottom: 1px solid;
  background: rgba(0, 0, 0, 0);
}

.picture-icon {
  width: 45px;
  height: 45px;
  padding: 10px;
  cursor: pointer;
  border-radius: 45px;
}

.picture-icon:hover {
  border: 1px solid;
}

#header .picture-icon:hover {
  padding: 9px;
}

#body .picture-icon {
  margin: 2px;
}

#header .selected,
#body .selected {
  width: 65px;
  height: 65px;
  padding: 0px;
  border-radius: 65px;
}

#header .selected:hover {
  padding: 0px;
  margin: 0px;
  border: none;
  opacity: 0.9;
}

#body .selected:hover {
  opacity: 0.5;
}

#body .picture-icon {
  border: 1px #999 solid;
}

#body .picture-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

#footer {
  margin: 0 auto;
  text-align: center;
}

#submit {
  width: 80px;
  height: 39px;
  cursor: pointer;
  font-size: 15px;
  margin: 30px auto;
  border: #42b983 1.5px solid;
  border-radius: 5px;
  background: rgb(255, 255, 255);
}

#submit:hover {
  background: rgba(0, 125, 0, 0.1);
}

#submit:active {
  background: rgb(255, 255, 255);
}

#contact-box {
  padding: 5px;
}

#contact-list-filter {
  position: sticky;
  top: 0;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

#filter-name {
  width: auto;
  height: 35px;
  font-size: 15px;
  margin: 0 5px;
  border: none;
  background: rgba(0, 0, 0, 0);
}

#contact-list {
  height: 600px;
  overflow: scroll;
}

.contact {
  display: flex;
  width: auto;
  height: auto;
  padding: 5px;
  color: rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.contact:hover {
  background: rgba(0, 0, 0, 0.1);
}

.contact h3 {
  width: auto;
  font-size: 15px;
  margin: 0 auto;
}

.contact p {
  width: auto;
  font-size: 12px;
  margin: 5px auto;
}

.contact .picture-icon {
  width: 50px;
  height: 50px;
  border-radius: 50px;
  margin-right: 0px;
  border: none;
}

.row-box {
  width: 180px;
  height: auto;
  padding: 10px 0px;
}

.text-box {
  width: auto;
  height: 20px !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

#contact-list-footer {
  text-align: center;
}

@media screen and (max-width: 780px) {
  #create {
    width: auto;
  }

  .card {
    width: 70%;
  }

  .row-box {
    width: 70%;
    height: auto;
  }
}
</style>
