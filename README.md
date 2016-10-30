# oauth-token

[![Build](https://travis-ci.org/MichalB/oauth-token.svg?branch=master)](https://travis-ci.org/MichalB/oauth-token)

## Instalation

```bash
$ npm install oauth-token
```

## Usage

##### Configure

```javascript
var options = {
  salt: 'some_random_string',
  // How long tokens will be valid since creation
  ttl: 86400,
  // Function for verifying validity of the application secret key
  checkAppSecret: function (userId, userSecret, cb) {
    // Return promise OR use callback
    return Promise.resolve(true)
  },
  // Function for verifying validity of the user secret key
  checkUserSecret: function (userId, userSecret, cb) {
    return Promise.resolve(true)
  },
  // Function for verifying the session existence
  checkSession: function (sessionId, cb) {
    return Promise.resolve(true)
  }
}

var OauthToken = require('oauth-token')(options)
```

##### Create token

```javascript
var data = {
  appId: 'my_app',
  appSecret: '9iZp4FqiubL6',
  userId: '198623486', // userId is required and must be string
  userSecret: '1HMuXS5KBTWQ',
  session: 'QxBfjfUQsD66'
}

/**
 * Create OAuth token
 * uses underscore because of the OAuth2 convention
 *
 * {
 *   access_token: 'HUdefAxx2Sxknx2QffZso2mgsSAmFLZpPrqPNVduZKNkCRaCqgLjh3rDzu8xJkkGsyx3XX6UWyZ2Yy9a4sQaBwss5R4f5bLsUat7ky8f5m1EJeE3N266ofqaA',
 *   refresh_token: '8VzrgFaYVH9LjodbgwKfFxy1EFiVraty2HCcHtsqNxGMkHrm5BNvfpPzJM2EmRCb4QS5R5pcdp83pxRM6juou4nDwc8EkJzrMhtLJALsMZnjeFt6U',
 *   token_type: 'Bearer',
 *   issued: 1477775581,
 *   expires_in: 86400
 * }
 */

// returns Promise
OauthToken.create(data).then(function (oauthToken) {
})

// OR use callback
OauthToken.create(data, function (err, oauthToken) {
})
```

##### Decode token

```javascript
var accessToken = 'HUdefAxx2Sxknx2QffZso2mgsSAmFLZpPrqPNVduZKNkCRaCqgLjh3rDzu8xJkkGsyx3XX6UWyZ2Yy9a4sQaBwss5R4f5bLsUat7ky8f5m1EJeE3N266ofqaA'

/**
 * Decode access_token to data
 *
 * {
 *   appId: 'my_app',
 *   appSecret: '9iZp4FqiubL6',
 *   userId: '198623486',
 *   userSecret: '1HMuXS5KBTWQ',
 *   session: 'QxBfjfUQsD66',
 *   issued: 1477775581,
 *   ttl: 86400
 * }
 *
 * checkAppSecret, checkUserSecret and checkSession
 * will be used for token validity verifying
 */

// returns Promise
OauthToken.decode(accessToken).then(function (data) {
})

// OR use callback
OauthToken.decode(accessToken, function (err, data) {
})
```

##### Refresh token

```javascript
var refreshToken = '8VzrgFaYVH9LjodbgwKfFxy1EFiVraty2HCcHtsqNxGMkHrm5BNvfpPzJM2EmRCb4QS5R5pcdp83pxRM6juou4nDwc8EkJzrMhtLJALsMZnjeFt6U'

/**
 * Create new OAuth token by refresh_token
 * all original values will be preserved only 'issued' will set on now
 *
 * {
 *   access_token: 'HUdefAxx2Sxknx2QffZso2mgsSAmFLZpPrqPNVduZKNkCRaCqgLjh3rDzu8xJkkGsyx3XX6UWyZ2Yy9a4sQaBwswWVrC3NnMAdK7BZYmtFCHYaTbWTTSUWpvk',
 *   refresh_token: '8VzrgFaYVH9LjodbgwKfFxy1EFiVraty2HCcHtsqNxGMkHrm5BNvfpPzJM2EmRCb4QS5R5pcdp83pxRM6juou4nDwc8EkJzrMhtLJALsMZnjeFt6U',
 *   token_type: 'Bearer',
 *   issued: 1477776104,
 *   expires_in: 86400
 * }
 */

// returns Promise
OauthToken.refresh(refreshToken).then(function (oauthToken) {
})

// OR use callback
OauthToken.refresh(refreshToken, function (err, oauthToken) {
})
```

## License

This tool is issued under the [MIT license](./LICENSE).
