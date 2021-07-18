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
    <div id="view-image">
      <img :src="resource" />
    </div>
    <a :href="resource" :download="saveFilename">Save Image</a>
  </div>
</template>

<script>
import Constant from '@/data/const.js';

import Back from '@/components/Back.vue';

import axios from 'axios';

export default {
  name: 'PictureViewer',
  components: {
    Back,
  },
  props: ['messageId'],
  methods: {
    async downloadImage(imageSource) {
      return await axios(imageSource, {
        method: 'GET',
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'image/jpeg',
          'X-Line-Access': this.$store.state.authToken,
          'X-Line-Application': Constant.LINE.APPLICATION_IDENTITY,
        },
      });
    },
    async getImageResource() {
      const imageURL = `${this.mediaURL}/os/m/${this.messageId}`;
      const imageXHR = await this.downloadImage(imageURL);
      this.resource =
        'data:image/jpeg;base64,' +
        Buffer.from(imageXHR.data).toString('base64');
    },
  },
  computed: {
    saveFilename() {
      return `${this.messageId}.jpg`;
    },
  },
  data() {
    return {
      resource: null,
      mediaURL: `//${Constant.LINE.MEDIA.HOST}`,
    };
  },
  created() {
    this.getImageResource();
  },
};
</script>

<style scoped>
.view {
  margin: 60px auto;
}

#view-image {
  margin: 20px;
}

#view-image img {
  width: 75%;
}
</style>
