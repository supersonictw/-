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
    <h2>Internal Error</h2>
    <p>Reason: {{ getErrorReason }}</p>
    <router-link to="/">Go to Index</router-link>
  </div>
</template>

<script>
export default {
  name: 'Error',
  props: ['reason'],
  computed: {
    getErrorReason() {
      if (this.reason) {
        return this.reason;
      }
      return 'Unknown';
    },
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
</style>
