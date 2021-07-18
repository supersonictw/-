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
    <div class="impact">
      <div class="intro-box">
        <h1>XIA</h1>
        <p>LINE Web Client for any platform.</p>
        <div class="logo">
          <img alt="XIA logo" src="@/assets/logo.svg" />
        </div>
        <div class="login-button">
          <router-link v-if="ready > 0" to="/dashboard">Dashboard</router-link>
          <router-link v-else-if="ready < 0" to="/login">Login</router-link>
          <span v-else>Loading...</span>
        </div>
      </div>
    </div>
    <div class="intro-box with-separate-line">
      <h2>What is XIA</h2>
      <p>
        XIA is a
        <a href="https://line.me" target="_blank" rel="noopener">LINE</a>
        Web Client based on Vue.js and built for every browser that everyone can
        keep in touch anywhere with their friends.
      </p>
      <div class="logo">
        <img alt="LINE logo" src="@/assets/line_logo.png" />
      </div>
    </div>
    <div class="intro-box">
      <h2>Feature</h2>
      <p>XIA keeps only the basic function to send and receive messages.</p>
      <p>
        If you hope to have a better experience, the best solution is using
        <a href="https://line.me/download" target="_blank" rel="noopener">
          LINE Apps
        </a>
        with installing required instead.
      </p>
      <div class="logo">
        <img alt="Chat Icon" src="@/assets/icons/chat.svg" />
      </div>
    </div>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

export default {
  name: 'Introducing',
  methods: {
    async checkAccess() {
      if (!window.localStorage.getItem(Constant.LOCAL_STORAGE.ACCESS_KEY)) {
        return this.ready--;
      }
      if (this.$store.state.loaded) {
        if (this.$store.state.system.ready) return this.ready++;
        else return this.ready--;
      }
      setTimeout(this.checkAccess, Constant.TIMEOUT.RETRY);
    },
  },
  data() {
    return {ready: 0};
  },
  mounted() {
    this.checkAccess();
  },
};
</script>

<style scoped>
.impact {
  width: auto;
  height: auto;
  padding: 80px;
  background: linear-gradient(35deg, #00ff00, #aa77ff);
}

h3 {
  margin: 40px 0 0;
}

.warning {
  color: #ff1100;
}

.intro-box {
  padding: 10px;
  width: 70%;
  height: auto;
  border-radius: 5px;
  margin: 0 auto;
  background: #fff;
}

.with-separate-line {
  margin-bottom: 10px;
  border-radius: 0 !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
}

.login-button {
  max-width: 90px;
  height: auto;
  padding: 10px;
  cursor: pointer;
  margin: 30px auto;
  border: #42b983 1.5px solid;
  border-radius: 5px;
  background: rgb(255, 255, 255);
}

.login-button a {
  text-decoration: none;
}

.login-button:hover {
  background: rgba(0, 125, 0, 0.1);
}

.login-button:active {
  background: rgb(255, 255, 255);
}

.logo {
  width: 70px;
  height: 70px;
  margin: 150px auto;
}

.logo img {
  width: 70px;
  height: 70px;
}

@media (max-width: 780px) {
  .impact {
    padding: 50px;
  }

  .logo {
    margin: 30px auto;
  }
}
</style>
