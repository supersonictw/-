/* jshint esversion: 8 */
/*
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
*/

import Constant from '@/data/const';
import {deleteDB, openDB} from 'idb';

export default class {
  constructor(systemInstance) {
    this.system = systemInstance;
    this.xia = null;
    this.user = null;
    this.userIdHash = null;
  }

  async init() {
    this.xia = await this.setupXIA();
    this.user = await this.setupUser();
  }

  updateUserIdHash(userIdHash) {
    this.userIdHash = userIdHash;
  }

  async setupXIA() {
    const upgradeFunction = (db, oldVersion) => {
      // Remove the old data structure
      if (oldVersion !== 0 && oldVersion < 3) {
        this.system.revoke();
        return;
      }
      if (oldVersion === 0) {
        // Databases List
        db.createObjectStore(
            Constant.IDB.XIA.DB_LIST,
            {keyPath: 'id'},
        );
      }
    };
    return openDB(
        Constant.NAME,
        Constant.IDB.XIA.VERSION,
        {upgrade: upgradeFunction},
    );
  }

  async setupUser() {
    const dbName = `${Constant.NAME}_${this.userIdHash}`;
    const localName =
            navigator.language ||
            navigator.userLanguage ||
            navigator.browserLanguage;
    return openDB(dbName, Constant.IDB.USER.VERSION, {
      upgrade(db, oldVersion, _, transaction) {
        const idbLocalOptions = {locale: localName};
        if (oldVersion === 1) {
          transaction
              .objectStore(Constant.IDB.USER.CONTACT)
              .createIndex(
                  'displayName',
                  'displayName',
                  idbLocalOptions,
              );
          transaction
              .objectStore(Constant.IDB.USER.GROUP.JOINED)
              .createIndex(
                  'displayName',
                  'name',
                  idbLocalOptions,
              );
          transaction
              .objectStore(Constant.IDB.USER.GROUP.INVITED)
              .createIndex(
                  'displayName',
                  'name',
                  idbLocalOptions,
              );
          return;
        }
        // Contact
        db.createObjectStore(
            Constant.IDB.USER.CONTACT,
            {keyPath: 'mid'},
        ).createIndex(
            'displayName',
            'displayName',
            idbLocalOptions,
        );
        // Group Joined
        db.createObjectStore(
            Constant.IDB.USER.GROUP.JOINED,
            {keyPath: 'id'},
        ).createIndex(
            'displayName',
            'name',
            idbLocalOptions,
        );
        // Group Invited
        db.createObjectStore(
            Constant.IDB.USER.GROUP.INVITED,
            {keyPath: 'id'},
        ).createIndex(
            'displayName',
            'name',
            idbLocalOptions,
        );
        // Preview Message Box
        db.createObjectStore(
            Constant.IDB.USER.PREVIEW_MESSAGE_BOX,
            {keyPath: 'target'},
        );
        // Message Box
        db.createObjectStore(
            Constant.IDB.USER.MESSAGE_BOX,
            {keyPath: 'id'},
        ).createIndex(
            'target',
            'target',
        );
        // Settings
        db.createObjectStore(
            Constant.IDB.USER.SETTINGS,
            {keyPath: 'id'},
        );
      },
    });
  }

  async clearMessageBox(targetId) {
    await this.user.delete(Constant.IDB.USER.PREVIEW_MESSAGE_BOX, targetId);
    const transaction = await this.user.transaction(
        Constant.IDB.USER.MESSAGE_BOX,
        'readwrite',
    );
    let cursor = await transaction.store.openCursor();
    while (cursor) {
      if (cursor.value.target === targetId) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }

  updateData(data, dataName) {
    data.forEach((metadata) =>
      this.user.put(dataName, metadata),
    );
  }

  async saveGroupInfo(groupId, accepted = false) {
    const data = await this.system.clients.query.getGroup(groupId);
    const localData = await this.user.get(
        Constant.IDB.USER.GROUP.JOINED, data.id,
    );
    if (accepted || localData) {
      await this.user.put(Constant.IDB.USER.GROUP.JOINED, data);
    } else {
      await this.user.put(Constant.IDB.USER.GROUP.INVITED, data);
      this.system.registerChatRoomIdHash(groupId);
    }
  }

  async getLatestRevision() {
    const data = await this.user.get(
        Constant.IDB.USER.SETTINGS,
        Constant.IDB.USER.KEY.SETTINGS_REVISION,
    );
    if (data) {
      return parseInt(data.value);
    } else {
      return await this.system.clients.query.getLastOpRevision();
    }
  }

  async waitForSyncData(tasks) {
    const status = await this.user.get(
        Constant.IDB.USER.SETTINGS,
        Constant.IDB.USER.KEY.SETTINGS_SYNC_STATUS,
    );
    if (status && status.value === true) return;
    await Promise.all(tasks);
    await this.user.put(Constant.IDB.USER.SETTINGS, {
      id: Constant.IDB.USER.KEY.SETTINGS_SYNC_STATUS,
      value: true,
    });
  }

  async fetchChatIdsHash() {
    for (const typeName of Constant.IDB.USER.ALL_CONTACT_TYPES) {
      let cursor = await this.user
          .transaction(typeName).store.openCursor();
      while (cursor) {
        this.system.registerChatRoomIdHash(cursor.key);
        cursor = await cursor.continue();
      }
    }
  }

  async reset(previousVersion) {
    let idbNames = [];
    if (previousVersion >= 3 || previousVersion === -1) {
      const idbXia = this.xia ? this.xia : await this.setupXIA();
      const allUsers = await idbXia.getAllKeys(Constant.IDB.XIA.DB_LIST);
      if (allUsers.length > 0) {
        idbNames = allUsers.map((name) => `${Constant.NAME}_${name}`);
        await idbXia.clear(Constant.IDB.XIA.DB_LIST);
      }
    } else if (previousVersion !== 0) {
      await deleteDB(Constant.NAME);
    }
    await Promise.all(idbNames.map((name) => deleteDB(name)));
  }
}
