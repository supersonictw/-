<!--
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
-->

<template>
  <div id="dashboard">
    <div class="header">
      <div class="float-right"><Logout /></div>
      <div id="profile-box">
        <router-link :title="profileDisplayName" to="/profile">
          <div id="profile">
            <img
              v-if="profilePicturePath"
              class="profile-icon"
              :src="mediaURL + profilePicturePath"
            />
            <img class="profile-icon" v-else src="@/assets/logo.svg" />
            <div>
              <div class="row-box">
                <h3 class="text-box">{{ profileDisplayName }}</h3>
                <p class="text-box">{{ profileStatusMessage }}</p>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    <div>
      <div id="tab-switcher" v-show="mobileUI">
        <a @click.prevent="tabSwitcher" href="#"
          >Display {{ tabSwitcherName }}</a
        >
      </div>
      <div id="lists">
        <ContactList v-show="!mobileUI || tabName === 'Contacts'" />
        <ChatList v-show="!mobileUI || tabName === 'Chats'" />
      </div>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

import Logout from '@/components/Logout.vue';
import ContactList from '@/components/Dashboard/ContactList.vue';
import ChatList from '@/components/Dashboard/ChatList.vue';

export default {
  name: 'Dashboard',
  components: {
    Logout,
    ContactList,
    ChatList,
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
      this.profileDisplayName = profile.displayName;
      this.profilePicturePath = profile.picturePath;
      this.profileStatusMessage = profile.statusMessage;
    },
    tabSwitcher() {
      const tabs = [this.tabName, this.tabSwitcherName];
      this.tabName = this.tabName === tabs[0] ? tabs[1] : tabs[0];
      this.tabSwitcherName =
        this.tabSwitcherName === tabs[0] ? tabs[1] : tabs[0];
    },
    async mobileDetector(e) {
      this.mobileUI = e.target.innerWidth < Constant.MOBILE_UI_WIDTH;
    },
  },
  data() {
    return {
      tabName: 'Contacts',
      tabSwitcherName: 'Chats',
      mobileUI: window.innerWidth < Constant.MOBILE_UI_WIDTH,
      profileDisplayName: 'Loading...',
      profileStatusMessage: 'Loading...',
      profilePicturePath: null,
      mediaURL: `//${Constant.LINE.MEDIA.HOST}`,
    };
  },
  created() {
    window.addEventListener('resize', this.mobileDetector);
    this.waitForFetchProfile();
  },
  destroyed() {
    window.removeEventListener('resize', this.mobileDetector);
  },
};
</script>

<style scoped>
#dashboard {
  width: 90%;
  min-width: 300px;
  margin: 60px auto;
}

.header {
  margin-bottom: 30px;
}

#profile-box {
  width: 250px;
  height: 70px;
  border-radius: 25px;
  border: 1px solid rgba(0, 0, 0, 0);
}

#profile-box:hover {
  border: 1px solid rgba(0, 0, 0, 0.3);
}

#profile-box a {
  text-decoration: none;
}

#profile {
  width: 200px;
  margin: 8px auto;
  display: flex;
  color: #000;
  overflow: hidden;
}

#profile .profile-icon {
  width: 50px;
  height: 50px;
  border-radius: 90px;
  margin-right: 10px;
}

.row-box {
  width: 135px;
  height: 30px;
}

.text-box {
  margin: 0;
  font-size: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

#profile p {
  width: auto;
  height: 20px;
  font-size: 12px;
  margin: 0;
}

#tab-switcher {
  text-align: right;
}

#lists {
  display: flex;
  justify-content: center;
}

.float-right {
  float: right;
}

@media screen and (max-width: 780px) {
  #profile-box {
    width: 180px;
  }
}
</style>
