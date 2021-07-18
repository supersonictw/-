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
    <h2>Redirecting...</h2>
    <p>The page will lead you to the page that you hoped.</p>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

export default {
  name: 'Redirect',
  props: ['next', 'data'],
  methods: {
    waitForGoToNextPage() {
      if (this.$store.state.system.ready) {
        this.$router.replace({
          name: this.next,
          params: this.data,
        });
      } else {
        setTimeout(this.waitForGoToNextPage, Constant.TIMEOUT.RETRY);
      }
    },
  },
  mounted() {
    if (this.next) this.waitForGoToNextPage();
    else this.$router.replace({name: Constant.ROUTER_TAG.NOT_FOUND});
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
