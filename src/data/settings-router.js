/* jshint esversion: 8 */
/*
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
*/

import Constant from '@/data/const.js';

import Overview from '@/views/Settings/Overview.vue';
import Profile from '@/views/Settings/Profile.vue';
import Notification from '@/views/Settings/Notification.vue';
import Preview from '@/views/Settings/Preview.vue';

export default [
  {
    path: '',
    name: Constant.ROUTER_TAG.SETTINGS.OVERVIEW,
    component: Overview,
  },
  {
    path: 'profile',
    name: Constant.ROUTER_TAG.SETTINGS.PROFILE,
    component: Profile,
  },
  {
    path: 'notification',
    name: Constant.ROUTER_TAG.SETTINGS.NOTIFICATION,
    component: Notification,
  },
  {
    path: 'preview',
    name: Constant.ROUTER_TAG.SETTINGS.PREVIEW,
    component: Preview,
  },
];
