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

export default class {
  constructor(pollClient, instances, system) {
    this.client = pollClient;
    this.idb = instances.idb;
    this.listener = instances.operation;
    this.system = system;
    this.revision = 0;
  }

  async start() {
    try {
      const operations = await this.client.fetchOperations(
          this.revision,
          Constant.FETCH_OP_NUM,
      );
      for (const operation of operations) {
        this.listener.trigger(operation);
      }
      await this.updateRevision(operations);
    } catch (e) {
      console.error(e);
      if (e.name === 'TalkException') {
        return this.system.revoke();
      }
    }
    await this.start(this.client);
  }

  async updateRevision(operations) {
    const opLength = operations.length;
    if (opLength === 0) return;
    if (opLength === 1) return (this.revision = operations[0].revision);
    const latestRev = operations[opLength - 1].revision;
    const secondRev = operations[opLength - 2].revision;
    this.revision = latestRev.compare(secondRev) ? secondRev : latestRev;
  }
}
