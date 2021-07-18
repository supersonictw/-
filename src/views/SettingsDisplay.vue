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
    <div id="settings">
      <router-view class="card" />
    </div>
  </div>
</template>

<script>
import Back from '@/components/Back.vue';

export default {
  name: 'Settings',
  components: {
    Back,
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

#settings {
  display: flex;
  text-align: left;
  justify-content: center;
  width: 800px;
  margin: 10px auto;
}

.card {
  width: 75%;
  height: auto;
  margin: 0 10px;
  padding: 25px;
  border: 1px solid;
  border-radius: 10px;
}

@media screen and (max-width: 780px) {
  #settings {
    width: auto;
  }

  .card {
    width: 70%;
  }
}
</style>
