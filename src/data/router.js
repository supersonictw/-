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
import VueRouter from 'vue-router';

import Constant from '@/data/const.js';

import SettingsRouter from '@/data/settings-router.js';

import Introducing from '@/views/Introducing.vue';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import Profile from '@/views/Profile.vue';
import Contact from '@/views/Contact.vue';
import Chat from '@/views/Chat.vue';
import PictureViewer from '@/views/PictureViewer.vue';
import Create from '@/views/Create.vue';
import SettingsDisplay from '@/views/SettingsDisplay.vue';
import About from '@/views/About.vue';
import Redirect from '@/views/Redirect.vue';
import ErrorPage from '@/views/Error.vue';
import NotFound from '@/views/NotFound.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: Constant.ROUTER_TAG.INTRODUCING,
    component: Introducing,
  },
  {
    path: '/login',
    name: Constant.ROUTER_TAG.LOGIN,
    component: Login,
  },
  {
    path: '/dashboard',
    name: Constant.ROUTER_TAG.DASHBOARD,
    component: Dashboard,
  },
  {
    path: '/profile',
    name: Constant.ROUTER_TAG.PROFILE,
    component: Profile,
  },
  {
    path: '/contact/:targetIdHash',
    name: Constant.ROUTER_TAG.CONTACT,
    component: Contact,
    props: true,
  },
  {
    path: '/chat/:targetIdHash',
    name: Constant.ROUTER_TAG.CHAT,
    component: Chat,
    props: true,
  },
  {
    path: '/chat/image',
    name: Constant.ROUTER_TAG.PICTURE_PREVIEW,
    component: PictureViewer,
    props: true,
  },
  {
    path: '/create/:type',
    name: Constant.ROUTER_TAG.CREATE,
    component: Create,
    props: true,
  },
  {
    path: '/settings',
    component: SettingsDisplay,
    children: SettingsRouter,
  },
  {
    path: '/about',
    name: Constant.ROUTER_TAG.ABOUT,
    component: About,
  },
  {
    path: '/redirect',
    name: Constant.ROUTER_TAG.REDIRECT,
    component: Redirect,
    props: true,
  },
  {
    path: '/error',
    name: Constant.ROUTER_TAG.ERROR,
    component: ErrorPage,
    props: true,
  },
  {
    path: '*',
    name: Constant.ROUTER_TAG.NOT_FOUND,
    component: NotFound,
  },
];

const Router = new VueRouter({
  routes,
});

export default Router;
