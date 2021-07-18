/* jshint esversion: 8 */
/*
    XIA - LINE Web Client
    ---
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  (c) 2021 SuperSonic. (https://github.com/supersonictw)
*/

const Constants = function() {
  const XIA_VERSION = '1.0.0';
  const USE_HTTPS = true;
  const httpUrlWrapper = function(domain, path, thrift) {
    if (thrift) {
      return domain;
    }
    const schema = USE_HTTPS ? 'https' : 'http';
    if (domain && !path) {
      return `${schema}://${domain}`;
    }
    return `${schema}://${domain}${path}`;
  };
  return {
    NAME: 'XIA',
    VERSION: XIA_VERSION,
    FETCH_OP_NUM: 50,
    MOBILE_UI_WIDTH: 780,
    THRIFT_DEFAULT_SEQ: 0,
    GROUP_INVITING_ICON: 'ⓘ',
    CHAT_DISPLAY_ROW_LIMIT: 50,
    USE_HTTPS,
    ROUTER_TAG: {
      INTRODUCING: 'Introducing',
      LOGIN: 'Login',
      DASHBOARD: 'Dashboard',
      PROFILE: 'Profile',
      CONTACT: 'Contact',
      CHAT: 'Chat',
      PICTURE_PREVIEW: 'PicturePreview',
      CREATE: 'Create',
      SETTINGS: {
        OVERVIEW: 'Settings - Overview',
        PROFILE: 'Settings - Profile',
        NOTIFICATION: 'Settings - Notification',
        PREVIEW: 'Settings - Preview Features',
      },
      ABOUT: 'About',
      REDIRECT: 'Redirect',
      ERROR: 'Error',
      NOT_FOUND: 'Not Found',
    },
    LOCAL_STORAGE: {
      ACCESS_KEY: 'XIA_AccessKey',
      ACCESS_CERTIFICATE_PREFIX: 'XIA_AccessCertificate',
    },
    IDB: {
      XIA: {
        VERSION: 5,
        DB_LIST: 'dbList',
      },
      USER: {
        VERSION: 2,
        CONTACT: 'contact',
        GROUP: {
          JOINED: 'groupJoined',
          INVITED: 'groupInvited',
        },
        get ALL_CONTACT_TYPES() {
          return [
            this.CONTACT,
            this.GROUP.JOINED,
            this.GROUP.INVITED,
          ];
        },
        PREVIEW_MESSAGE_BOX: 'previewMessageBox',
        MESSAGE_BOX: 'messageBox',
        SETTINGS: 'settings',
        KEY: {
          SETTINGS_SYNC_STATUS: 'syncStatus',
          SETTINGS_REVISION: 'revision',
        },
      },
    },
    LINE: {
      PLATFORM: {
        ID: 'CHROMEOS',
        NAME: 'Chrome_OS',
        get VERSION() {
          return this.NAME;
        },
      },
      get APPLICATION_IDENTITY() {
        return [
          this.PLATFORM.ID,
          XIA_VERSION,
          this.PLATFORM.NAME,
          this.PLATFORM.VERSION,
        ].join('\t');
      },
      HOST: 'gf.line.naver.jp',
      PATH: {
        AUTH: '/api/v4/TalkService.do',
        LOGIN: '/api/v4p/rs',
        CERTIFICATE: '/Q',
        QUERY: '/S4',
        POLL: '/P4',
      },
      MEDIA: {
        HOST: 'obs.line-apps.com',
      },
      STICKER: {
        HOST: 'sdl-stickershop.line.naver.jp',
        PLATFORM: 'PC',
      },
    },
    TIMEOUT: {
      WAIT: 100,
      RETRY: 30,
    },
    httpUrlWrapper,
  };
}();

export default Constants;
