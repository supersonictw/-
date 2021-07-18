<!--
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
-->

<template>
  <div class="container">
    <h2>Profile</h2>
    <form method="post">
      <div class="box">
        <img class="icon" v-if="picturePath" :src="mediaURL + picturePath" />
        <img class="icon" v-else src="@/assets/logo.svg" />
        <div class="text-box">
          <input
            class="text-box"
            placeholder="Enter your name. (Required)"
            id="display-name"
            type="text"
            autocomplete="off"
            v-model="displayName"
            required
            :disabled="disableInput"
          />
          <textarea
            class="text-box"
            placeholder="Enter your status message. (Optional)"
            id="status-message"
            type="text"
            v-model="statusMessage"
            :disabled="disableInput"
          />
        </div>
      </div>
      <input
        type="submit"
        id="submit"
        value="Submit"
        @click.prevent="updateProfile"
        :disabled="disableInput"
      />
    </form>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

export default {
  name: 'Settings_Profile',
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
      this.disableInput = false;
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
    async updateProfile() {
      if (this.displayName.length < 1) return;
      this.disableInput = true;
      const client = this.$store.state.system.clients.query;
      const profile = await client.getProfile();
      profile.displayName = this.displayName;
      profile.statusMessage = this.statusMessage;
      await client.updateProfile(Constant.THRIFT_DEFAULT_SEQ, profile);
      await this.$router.replace({name: Constant.ROUTER_TAG.SETTINGS.OVERVIEW});
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
      disableInput: true,
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
.container {
  text-align: center;
  height: 150px;
  width: auto;
  background: #ffffff;
  margin: 60px auto;
}

.box {
  display: flex;
}

.icon {
  width: 145px;
  height: 145px;
  padding: 10px;
  cursor: pointer;
  border-radius: 145px;
}

.icon:hover {
  opacity: 0.5;
}

#display-name {
  width: 75%;
  margin: 20px;
  padding: 10px;
  border: none;
  font-size: 25px;
  text-align: center;
  background: rgba(0, 0, 0, 0);
  border-bottom: 1px rgba(0, 0, 0, 0.3) solid;
}

#status-message {
  width: 70%;
  height: 30%;
  resize: none;
  border: none;
  font-size: 15px;
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
</style>
