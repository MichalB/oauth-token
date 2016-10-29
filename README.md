# oauth-token

[![Build](https://travis-ci.org/MichalB/oauth-token.svg?branch=master)](https://travis-ci.org/MichalB/oauth-token)

## Instalation

```bash
$ npm install oauth-token
```

## Usage

```javascript
var options = {
  salt: 'some_random_string',
  expires_in: 86400 // 24 hours
}

var OauthToken = require('./')(options)

var oauthToken = OauthToken.create({
  app_id: 'my_app',
  app_secret: '9iZp4FqiubL6',
  user_id: '198623486', // user_id is required and must be string
  user_secret: '1HMuXS5KBTWQ',
  session: 'QxBfjfUQsD66'
})

/**
 * Returns
 * {
 *   access_token: 'HUdefAxx2Sxknx2QffZso2mgsSAmFLZpPrqPNVduZKNkCRaCqgLjh3rDzu8xJkkGsyx3XX6UWyZ2Yy9a4sQaBwss5R4f5bLsUat7ky8f5m1EJeE3N266ofqaA',
 *   refresh_token: '8VzrgFaYVH9LjodbgwKfFxy1EFiVraty2HCcHtsqNxGMkHrm5BNvfpPzJM2EmRCb4QS5R5pcdp83pxRM6juou4nDwc8EkJzrMhtLJALsMZnjeFt6U',
 *   token_type: 'Bearer',
 *   issued: 1477775581,
 *   expires_in: 86400
 * }
 */

var data = OauthToken.decode(oauthToken.access_token)

/**
 * Returns
 * {
 *   app_id: 'my_app',
 *   app_secret: '9iZp4FqiubL6',
 *   user_id: '198623486',
 *   user_secret: '1HMuXS5KBTWQ',
 *   session: 'QxBfjfUQsD66',
 *   issued: 1477775581,
 *   expires_in: 86400
 * }
 */

var newToken = OauthToken.refresh(oauthToken.refresh_token)

/**
 * Returns
 * {
 *   access_token: 'HUdefAxx2Sxknx2QffZso2mgsSAmFLZpPrqPNVduZKNkCRaCqgLjh3rDzu8xJkkGsyx3XX6UWyZ2Yy9a4sQaBwswWVrC3NnMAdK7BZYmtFCHYaTbWTTSUWpvk',
 *   refresh_token: '8VzrgFaYVH9LjodbgwKfFxy1EFiVraty2HCcHtsqNxGMkHrm5BNvfpPzJM2EmRCb4QS5R5pcdp83pxRM6juou4nDwc8EkJzrMhtLJALsMZnjeFt6U',
 *   token_type: 'Bearer',
 *   issued: 1477776104,
 *   expires_in: 86400
 * }
 */
```

## License

This tool is issued under the [MIT license](./LICENSE).
