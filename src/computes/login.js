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
import lineType from '@/computes/protocol/line_types';
import utf8 from 'utf8';
import crypto from 'node-bignumber';
import hash from 'js-sha256';
import axios from 'axios';

export default class {
  constructor(clients) {
    this.user = {};
    this.status = '';
    this.clients = clients;
  }

  update(user) {
    this.user = user;
  }

  async action() {
    const loginRequest = await this.getCredential();
    const loginResponse = await this.clients.login
        .loginZ(loginRequest)
        .catch((error) => (this.setStatus(error.reason)));
    if (loginResponse !== this.status) {
      try {
        return await this.verifyPinCode(loginResponse);
      } catch (e) {
        console.error(e);
        return false;
      }
    }
  }

  getCredentialMessage(sessionKey) {
    const getChar = (text) => String.fromCharCode(text.length);
    const sessionKeyMessage = getChar(sessionKey) + sessionKey;
    const identityMessage = getChar(this.user.identity) + this.user.identity;
    const passwordMessage = getChar(this.user.password) +this.user. password;
    const message = sessionKeyMessage + identityMessage + passwordMessage;
    return utf8.encode(message);
  }

  async getCredential() {
    const rsaKey = await this.clients.auth.getRSAKeyInfo(
        lineType.IdentityProvider.LINE,
    );
    const message = this.getCredentialMessage(
        rsaKey.sessionKey,
        this.user.identity,
        this.user.password,
    );
    const rsa = new crypto.Key();
    rsa.setPublic(rsaKey.nvalue, rsaKey.evalue);
    const encryptedMessage = rsa.encrypt(message).toString();
    const prefix = Constant.LOCAL_STORAGE.ACCESS_CERTIFICATE_PREFIX;
    const certificateCookie =`${prefix}_${hash.sha256(this.user.identity)}`;
    const certificate = window.localStorage.getItem(certificateCookie);
    return new lineType.LoginRequest({
      type: lineType.LoginType.ID_CREDENTIAL,
      identityProvider: lineType.IdentityProvider.LINE,
      identifier: rsaKey.keynm,
      password: encryptedMessage,
      keepLoggedIn: true,
      accessLocation:
      this.user.ip_addr,
      systemName: Constant.NAME,
      e2eeVersion: 0,
      certificate,
    });
  }

  async verifyPinCode(loginResult) {
    this.setStatus(
        `Confirm your PinCode with ${loginResult.pinCode} in 2 minutes.`,
    );
    switch (loginResult.type) {
      case lineType.LoginResultType.REQUIRE_DEVICE_CONFIRM: {
        const targetUrl = Constant.httpUrlWrapper(
            Constant.LINE.HOST,
            Constant.LINE.PATH.CERTIFICATE,
        );
        const certificateRequest ={
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Line-Access': loginResult.verifier,
            'X-Line-Application': Constant.LINE.APPLICATION_IDENTITY,
          },
        };
        const certificateResponse = await axios(targetUrl, certificateRequest);
        const accessKey = certificateResponse.data;
        const verifyRequest = new lineType.LoginRequest({
          type: lineType.LoginType.QRCODE,
          identityProvider: lineType.IdentityProvider.LINE,
          verifier: accessKey.result.verifier,
          keepLoggedIn: true,
          accessLocation: this.user.ip_addr,
          systemName: Constant.NAME,
          e2eeVersion: 0,
        });
        const verifyResult = await this.clients.login.loginZ(verifyRequest);
        if (verifyResult.type === lineType.LoginResultType.SUCCESS) {
          this.setStatus('Successful');
          this.setAuthToken(verifyResult.authToken);
          this.setAccessCertificate(verifyResult.certificate);
          return true;
        }
        this.setStatus('Unknown Error');
        return false;
      }
      case lineType.LoginResultType.REQUIRE_QRCODE:
        this.setStatus(
            'Login with QR Code required, but there should be nothing to do.',
        );
        return false;
      case lineType.LoginResultType.SUCCESS:
        this.setStatus('Successful');
        this.setAuthToken(loginResult.authToken);
        return true;
    }
  }

  setStatus(message) {
    this.status = message;
  }

  setAuthToken(authToken) {
    window.localStorage.setItem(Constant.LOCAL_STORAGE.ACCESS_KEY, authToken);
  }

  setAccessCertificate(certificate) {
    const prefix = Constant.LOCAL_STORAGE.ACCESS_CERTIFICATE_PREFIX;
    const cookieName = `${prefix}_${hash.sha256(this.user.identity)}`;
    window.localStorage.setItem(cookieName, certificate);
  }
}
