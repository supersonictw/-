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
import hash from 'js-sha256';

export default class {
  constructor(queryClient, instances, systemInstance) {
    this.client = queryClient;
    this.idb = instances.idb;
    this.system = systemInstance;
  }

  async init(profileData) {
    try {
      this.syncProfile(profileData);
      await this.idb.waitForSyncData([
        this.syncContact(),
        this.syncGroupJoined(),
        this.syncGroupInvited(),
      ]);
      await this.idb.fetchChatIdsHash();
      this.revision = await this.idb.getLatestRevision();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  syncProfile(profileData) {
    this.system.profile.userId = profileData.mid;
    this.system.profile.userIdHash = hash.sha256(profileData.mid);
    this.system.profile.displayName = profileData.displayName;
    this.system.profile.picturePath = profileData.picturePath;
    this.system.profile.statusMessage = profileData.statusMessage;
  }

  async syncContact() {
    const contactIds = await this.client.getAllContactIds();
    if (contactIds) {
      const contactData = await this.client.getContacts(contactIds);
      this.idb.updateData(contactData, Constant.IDB.USER.CONTACT);
    }
  }

  async syncGroupJoined() {
    const groupIdsJoined = await this.client.getGroupIdsJoined();
    if (groupIdsJoined) {
      const groupDataJoined = await this.client.getGroups(groupIdsJoined);
      this.idb.updateData(groupDataJoined, Constant.IDB.USER.GROUP.JOINED);
    }
  }

  async syncGroupInvited() {
    const groupIdsInvited = await this.client.getGroupIdsInvited();
    if (groupIdsInvited) {
      const groupDataInvited = await this.client.getGroups(groupIdsInvited);
      this.idb.updateData(groupDataInvited, Constant.IDB.USER.GROUP.INVITED);
    }
  }
}
