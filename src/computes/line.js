/* jshint esversion: 8 */
/*
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
*/

require('error-polyfill');

import thrift from 'thrift';
import Constant from '@/data/const.js';
import talkService from '@/computes/protocol/TalkService.js';

const lineClient = function(path, authToken = null) {
  const header = {
    'X-Line-Application': Constant.LINE.APPLICATION_IDENTITY,
  };

  if (authToken !== null) {
    header['X-Line-Access'] = authToken;
  }

  const host = Constant.httpUrlWrapper(Constant.LINE.HOST, null, true);
  const port = Constant.USE_HTTPS ? 443 : 80;
  const opts = {
    transport: thrift.TBufferedTransport,
    protocol: thrift.TCompactProtocol,
    headers: header,
    https: Constant.USE_HTTPS,
    path: path,
    useCORS: true,
  };

  const connection = thrift.createHttpConnection(host, port, opts);
  const thriftClient = thrift.createHttpClient(talkService, connection);

  connection.on('error', (err) => {
    console.error(err);
  });

  return thriftClient;
};

export default lineClient;
