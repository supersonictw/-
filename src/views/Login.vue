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
    <div id="login-box">
      <div id="header">
        <div id="logo">
          <img alt="XIA logo" src="@/assets/logo.svg" />
        </div>
        <h1>XIA</h1>
      </div>
      <h3>
        Login with
        <a href="https://line.me" target="_blank" rel="noopener">LINE</a>
        account.
      </h3>
      <p class="warning">{{ handler.status }}</p>
      <form method="post">
        <div id="login-input-box">
          <input
            id="line-identity"
            type="email"
            autocomplete="on"
            class="form-control login-input-box-text"
            placeholder="Email"
            v-model="user.identity"
            required
          />
          <input
            id="line-password"
            type="password"
            autocomplete="on"
            class="form-control login-input-box-text"
            placeholder="Password"
            v-model="user.password"
            required
          />
        </div>
        <div>
          <input
            type="submit"
            class="login-input-box-submit"
            value="Login"
            @click.prevent="loginSubmit"
            :disabled="processing"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Back from '@/components/Back.vue';
import axios from 'axios';

export default {
  name: 'Login',
  components: {Back},
  data() {
    return {
      user: {
        ip_addr: 'Unknown',
        identity: '',
        password: '',
      },
      processing: false,
    };
  },
  methods: {
    async loginSubmit() {
      if (this.processing) return;
      if (this.user.identity.length < 1 || this.user.password.length < 1) {
        this.handler.setStatus('Empty identity or password');
        return;
      }
      this.processing = true;
      try {
        this.handler.update(this.user);
        const status = await this.handler.action();
        if (status === true) {
          window.location.reload();
        }
      } catch (e) {
        console.error(e);
      }
      this.processing = false;
    },
    async getUserIP() {
      const response = await axios('https://restapi.starinc.xyz/basic/ip');
      const result = response.data;
      return result.data.ip_addr;
    },
  },
  computed: {
    handler() {
      if (!this.$store.state.system.instances.login) {
        this.$router.replace('/');
      }
      return this.$store.state.system.instances.login;
    },
  },
  async created() {
    this.user.ip_addr = await this.getUserIP();
  },
};
</script>

<style scoped>
.view {
  margin: 60px auto;
}

.warning {
  color: #ff1100;
}

#login-box {
  width: 35%;
  height: auto;
  padding: 10px;
  border-radius: 10px;
  margin: 60px auto;
  background: #fff;
}

#login-input-box {
  width: auto;
  padding: 10px;
  margin: 0 auto;
}

.login-input-box-text {
  width: 90%;
  height: 30px;
  margin: 10px auto;
  font-size: 15px;
  padding: 5px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}

.login-input-box-submit {
  width: 80px;
  height: 39px;
  cursor: pointer;
  font-size: 15px;
  margin: 30px auto;
  border: #42b983 2px solid;
  border-radius: 5px;
  background: rgb(255, 255, 255);
}

.login-input-box-submit:hover {
  background: rgba(0, 125, 0, 0.1);
}

.login-input-box-submit:active {
  background: rgb(255, 255, 255);
}

#header {
  width: 100%;
  height: auto;
}

#logo {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  border-color: #000;
  border-radius: 70px;
}

#logo img {
  width: auto;
  height: auto;
}

@media (max-width: 780px) {
  #login-box {
    width: auto;
  }
}
</style>
