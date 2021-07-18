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
      <img class="icon" v-if="picturePath" :src="mediaURL + picturePath" />
      <img class="icon" v-else src="@/assets/logo.svg" />
      <h1 id="displayName">{{ displayName }}</h1>
      <div id="statusMessage-box">
        <p id="statusMessage" v-html="statusMessageWithLinesAndEscaped"></p>
      </div>
    </div>
    <div id="contact-buttons">
      <div class="dropdown">
        <div title="Create" class="contact-button">
          <img alt="Create" src="@/assets/icons/append.svg" />
        </div>
        <div class="dropdown-content">
          <a id="group" title="Group" href="#" @click.prevent="enterCreate">
            <img
              class="dropdown-content-icon"
              alt="Group"
              src="@/assets/icons/group.svg"
            />Group
          </a>
          <!--
          <a id="room" title="Room" href="#" @click.prevent="enterCreate">
            <img
              class="dropdown-content-icon"
              alt="Room"
              src="@/assets/icons/room.svg"
            />Room
          </a>
          -->
        </div>
      </div>
      <router-link title="Settings" class="contact-button" to="/settings">
        <img alt="Settings" class="icon" src="@/assets/icons/settings.svg" />
      </router-link>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

import Back from '@/components/Back.vue';

export default {
  name: 'Profile',
  components: {
    Back,
  },
  methods: {
    async waitForFetchProfile() {
      setTimeout(() => {
        if (this.$store.state.system.ready) {
          this.fetchProfile();
        } else {
          this.waitForFetchProfile();
        }
      }, Constant.TIMEOUT.RETRY);
    },
    fetchProfile() {
      const profile = this.$store.state.system.profile;
      this.displayName = profile.displayName;
      this.picturePath = profile.picturePath;
      this.statusMessage = profile.statusMessage;
    },
    enterCreate(e) {
      this.$router.push({
        name: Constant.ROUTER_TAG.CREATE,
        params: {type: e.target.id},
      });
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
    statusMessageWithLinesAndEscaped() {
      return this.escapeHtml(this.statusMessage).replace(/\n/g, '<br />');
    },
  },
  data() {
    return {
      displayName: 'Loading...',
      statusMessage: 'Loading...',
      picturePath: null,
      mediaURL: `//${Constant.LINE.MEDIA.HOST}`,
    };
  },
  created() {
    this.waitForFetchProfile();
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
  background: rgba(25, 225, 25, 0.1);
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

#contact-buttons {
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
  margin-bottom: 0px;
  padding: 15px;
  cursor: pointer;
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

.contact-button-icon {
  width: 35px;
  height: 35px;
  padding-top: 13px;
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
  #profile {
    text-align: center;
  }
}
</style>
