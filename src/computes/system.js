/* jshint esversion: 8 */
/*
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
*/

import IDB from '@/data/idb';
import Sync from '@/data/sync';
import Login from '@/computes/login';
import Operation from '@/computes/operation';
import Poll from '@/computes/poll';
import lineClient from '@/computes/line';
import Constants from '@/data/const';
import hash from 'js-sha256';

export default class {
  constructor(authToken=null) {
    this.ready = false;
    this.clients = {};
    this.instances = {};
    this.profile = {};
    this.chatRoomIdHash = new Map();
    this.authToken = authToken;
    if (!authToken) {
      this.clients.login = lineClient(
          Constants.LINE.PATH.LOGIN,
      );
      this.clients.auth = lineClient(
          Constants.LINE.PATH.AUTH,
      );
      this.instances.login = new Login(this.clients);
    } else {
      this.clients.query = lineClient(
          Constants.LINE.PATH.QUERY,
          this.authToken,
      );
      this.clients.poll = lineClient(
          Constants.LINE.PATH.POLL,
          this.authToken,
      );
      this.service().then(
          () => (this.ready = true),
      );
    }
  }

  async service() {
    let profile = null;
    try {
      profile = await this.clients.query.getProfile();
    } catch (e) {
      console.error(e);
      if (e.name === 'TalkException') {
        await this.revoke();
      }
    }
    this.instances.idb = new IDB(this);
    this.instances.sync = new Sync(
        this.clients.query,
        this.instances,
        this,
    );
    this.instances.operation = new Operation(
        this.clients.query,
        this.instances,
        this,
    );
    this.instances.poll = new Poll(
        this.clients.poll,
        this.instances,
        this,
    );
    await this.instances.idb.init();
    await this.instances.sync.init(profile);
    this.instances.idb.updateUserIdHash(this.profile.userIdHash);
    this.instances.poll.start();
  }

  sendMessage() {
  }

  registerChatRoomIdHash(targetId) {
    this.chatRoomIdHash.set(hash.sha256(targetId), targetId);
  }

  unregisterChatIdHashed(state, idHash) {
    this.chatRoomIdHash.delete(idHash);
  }

  revoke() {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.location.reload();
  }
}
