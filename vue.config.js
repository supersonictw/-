/* jshint esversion: 8 */
/*
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
*/

module.exports = {
  pages: {
    index: {
      title: 'XIA',
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
    },
  },
  devServer: {
    disableHostCheck: true,
  },
};
