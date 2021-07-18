<!--
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
-->

<template>
  <div>
    <div id="setting-list-header">
      <div id="setting-list-header-title">
        <img class="picture-icon" src="@/assets/logo.svg" />
        <h3>XIA</h3>
      </div>
      <p>LINE Web Client for any platform.</p>
    </div>
    <div id="setting-list-filter">
      <input
        id="filter-name"
        type="text"
        maxlength="20"
        placeholder="Search"
        v-model="filterName"
      />
    </div>
    <div id="setting-list">
      <div
        class="setting-item"
        v-for="(item, itemId) in displayList"
        :key="itemId"
      >
        <a
          :title="item.displayName"
          href="#"
          @click.prevent="enterSetting(item.router)"
        >
          <div class="setting">
            <img class="picture-icon" :src="item.icon" />
            <div class="row-box">
              <h3 class="text-box">{{ item.displayName }}</h3>
              <p class="text-box">{{ item.description }}</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

export default {
  name: 'Settings_Overview',
  methods: {
    enterSetting(routerData) {
      this.$router.push(routerData);
    },
  },
  computed: {
    displayList() {
      return this.overview.filter((obj) => {
        const item = obj.displayName.toLowerCase();
        return item.includes(this.filterName.toLowerCase());
      });
    },
  },
  data() {
    return {
      filterName: '',
      overview: [
        {
          displayName: 'Profile',
          description: 'Customize your LINE Profile.',
          icon: require('@/assets/icons/profile.svg'),
          router: {
            name: Constant.ROUTER_TAG.SETTINGS.PROFILE,
          },
        },
        {
          displayName: 'Notification',
          description: 'Set up how XIA notice you while news coming.',
          icon: require('@/assets/icons/notification.svg'),
          router: {
            name: Constant.ROUTER_TAG.SETTINGS.NOTIFICATION,
          },
        },
        {
          displayName: 'Preview Features',
          description: 'Enable/Disable the features that aren\'t complete.',
          icon: require('@/assets/icons/preview_features.svg'),
          router: {
            name: Constant.ROUTER_TAG.SETTINGS.PREVIEW,
          },
        },
        {
          displayName: 'About',
          description: 'The information of XIA.',
          icon: require('@/assets/icons/about.svg'),
          router: {
            name: Constant.ROUTER_TAG.ABOUT,
          },
        },
      ],
    };
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

.picture-icon {
  width: 45px;
  height: 45px;
  padding: 10px;
  cursor: pointer;
  border-radius: 45px;
}

.picture-icon:hover {
  padding: 9px;
  border: 1px solid;
}

#setting-list-header {
  width: auto;
  height: 135px;
  margin: 10px;
}

#setting-list-header-title {
  display: flex;
}

#setting-list-header h3 {
  width: 50px;
  font-size: 32px;
  margin: 15px;
}

#setting-list-filter {
  position: sticky;
  top: 0;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  padding: 0px 10px;
}

#filter-name {
  width: 340px;
  height: 35px;
  font-size: 15px;
  margin: 0 5px;
  border: none;
  background: rgba(0, 0, 0, 0);
}

#setting-list {
  height: 300px;
  padding: 10px 0px;
  overflow: scroll;
}

.setting {
  display: flex;
  width: auto;
  height: auto;
  padding: 5px;
  border-radius: 45px;
  color: rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.setting:hover {
  background: rgba(0, 0, 0, 0.1);
}

.setting h3 {
  width: auto;
  font-size: 15px;
  margin: 0 auto;
}

.setting p {
  width: auto;
  font-size: 12px;
  margin: 5px auto;
}

.setting .picture-icon {
  width: 50px;
  height: 50px;
  border-radius: 50px;
  margin-right: 0px;
  border: none;
}

.setting .picture-icon:hover {
  padding: 10px;
  border: none;
}

.row-box {
  width: 450px;
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

@media screen and (max-width: 780px) {
  .row-box {
    width: 70%;
    height: auto;
  }
}
</style>
