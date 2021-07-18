<!--
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
-->

<template>
  <a title="Logout" @click.prevent="logout" href="#">
    <div id="logout">
      <div id="logout-box">
        <img id="logout-icon" alt="Logout" src="@/assets/icons/logout.svg" />
        <span id="logout-text">Logout</span>
      </div>
    </div>
  </a>
</template>

<script>
export default {
  name: 'Logout',
  methods: {
    logout() {
      this.$store.state.client.logout();
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.location.reload();
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}

#logout {
  width: auto;
  height: auto;
  margin-right: 30px;
  padding: 10px;
  border: 1px solid;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0);
}

#logout:hover {
  background: rgba(0, 125, 0, 0.1);
}

#logout:active {
  color: rgb(255, 255, 255);
  background: rgb(125, 220, 150);
}

#logout-box {
  display: flex;
  margin: 0;
}

#logout-icon {
  width: auto;
  height: 20px;
  margin-right: 10px;
}

#logout-text {
  width: auto;
  height: auto;
}
</style>
