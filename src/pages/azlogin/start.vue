<template>
  <div>
  </div>
</template>

<script>
import * as microsoftTeams from "@microsoft/teams-js"
import * as LocalStorageHelper from '../../sub/helper/base/LocalStorageHelper'
import { APP, MSTEAMS_APP } from '../../sub/constant/config'

export default {
  async mounted() {
    microsoftTeams.initialize()
    microsoftTeams.getContext((context) => {
        // Generate random state string and store it, so we can verify it in the callback
        let state = this._guid(); // _guid() is a helper function in the sample
        localStorage.setItem("aad.state", state);
        localStorage.removeItem("aad.error");
        // Go to the Azure AD authorization endpoint
        let queryParams = {
            client_id: MSTEAMS_APP.APP_ID,
            response_type: "id_token token",
            response_mode: "fragment",
            resource: "https://graph.microsoft.com",
            redirect_uri: window.location.origin + "/azlogin/end/",
            nonce: this._guid(),
            state: state,
            // The context object is populated by Teams; the loginHint attribute
            // is used as hinting information
            login_hint: context.loginHint,
        };

        let authorizeEndpoint = "https://login.microsoftonline.com/" + context.tid + "/oauth2/authorize?" + this.toQueryString(queryParams);
        window.location.assign(authorizeEndpoint);
    })   
  },
  methods: {
    toQueryString(queryParams) {
      let encodedQueryParams = [];
      for (let key in queryParams) {
        encodedQueryParams.push(key + "=" + encodeURIComponent(queryParams[key]));
      }
      return encodedQueryParams.join("&");
    },
    _decimalToHex(number) {
      var hex = number.toString(16);
      while (hex.length < 2) {
        hex = '0' + hex;
      }
      return hex;
    },
    _guid() {
      var cryptoObj = window.crypto || window.msCrypto; // for IE 11
      if (cryptoObj && cryptoObj.getRandomValues) {
          var buffer = new Uint8Array(16);
          cryptoObj.getRandomValues(buffer);
          //buffer[6] and buffer[7] represents the time_hi_and_version field. We will set the four most significant bits (4 through 7) of buffer[6] to represent decimal number 4 (UUID version number).
          buffer[6] |= 0x40; //buffer[6] | 01000000 will set the 6 bit to 1.
          buffer[6] &= 0x4f; //buffer[6] & 01001111 will set the 4, 5, and 7 bit to 0 such that bits 4-7 == 0100 = "4".
          //buffer[8] represents the clock_seq_hi_and_reserved field. We will set the two most significant bits (6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively.
          buffer[8] |= 0x80; //buffer[8] | 10000000 will set the 7 bit to 1.
          buffer[8] &= 0xbf; //buffer[8] & 10111111 will set the 6 bit to 0.
          return this._decimalToHex(buffer[0]) + this._decimalToHex(buffer[1]) + this._decimalToHex(buffer[2]) + this._decimalToHex(buffer[3]) + '-' + this._decimalToHex(buffer[4]) + this._decimalToHex(buffer[5]) + '-' + this._decimalToHex(buffer[6]) + this._decimalToHex(buffer[7]) + '-' +
              this._decimalToHex(buffer[8]) + this._decimalToHex(buffer[9]) + '-' + this._decimalToHex(buffer[10]) + this._decimalToHex(buffer[11]) + this._decimalToHex(buffer[12]) + this._decimalToHex(buffer[13]) + this._decimalToHex(buffer[14]) + this._decimalToHex(buffer[15]);
      }
      else {
        var guidHolder = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
        var hex = '0123456789abcdef';
        var r = 0;
        var guidResponse = "";
        for (var i = 0; i < 36; i++) {
            if (guidHolder[i] !== '-' && guidHolder[i] !== '4') {
                // each x and y needs to be random
                r = Math.random() * 16 | 0;
            }
            if (guidHolder[i] === 'x') {
                guidResponse += hex[r];
            } else if (guidHolder[i] === 'y') {
                // clock-seq-and-reserved first hex is filtered and remaining hex values are random
                r &= 0x3; // bit and with 0011 to set pos 2 to zero ?0??
                r |= 0x8; // set pos 3 to 1 as 1???
                guidResponse += hex[r];
            } else {
                guidResponse += guidHolder[i];
            }
        }
        return guidResponse;
      }      
    }
  }
}

</script>

<style>
</style>
