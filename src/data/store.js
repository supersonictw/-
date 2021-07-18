/* jshint esversion: 8 */
/*
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
*/

import Vue from 'vue';
import Vuex from 'vuex';
import System from '@/computes/system';

Vue.use(Vuex);

const Store = new Vuex.Store({
  state: {
    loaded: 0,
    notifications: [],
    statusMessage: null,
    system: new System(),
  },
  mutations: {
    setLoaded(state) {
      state.loaded++;
    },
    registerNewSystemInstance(state, system) {
      if (state.system) delete state.system;
      state.system = system;
    },
    notify(state, {title, description}) {
      state.notifications.push({title, description});
      setTimeout(state.notifications.pop(), 3000);
    },
  },
});

export default Store;
