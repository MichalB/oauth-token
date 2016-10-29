'use strict'

module.exports = function (options) {
  options = options || {}
  options.salt = options.salt || ''
  // time to live in seconds (1 hour by default)
  options.expires_in = options.expires_in || 3600

  var AccessToken = require('./access-token')(options.salt)
  var ACCESS_TOKEN = AccessToken.TokenType.ACCESS_TOKEN
  var REFRESH_TOKEN = AccessToken.TokenType.REFRESH_TOKEN

  function isExpired (token) {
    if (token.expires_in === 0) {
      return false
    }
    return (Date.now() / 1000 | 0) > (token.issued + token.expires_in)
  }

  function create (data) {
    data.issued = data.issued || Date.now() / 1000 | 0
    if (!data.hasOwnProperty('expires_in')) {
      data.expires_in = options.expires_in
    }

    return {
      access_token: AccessToken.encode({
        type: ACCESS_TOKEN,
        app_id: data.app_id,
        app_secret: data.app_secret,
        user_id: data.user_id,
        user_secret: data.user_secret,
        session: data.session,
        issued: data.issued,
        expires_in: data.expires_in
      }),
      refresh_token: AccessToken.encode({
        type: REFRESH_TOKEN,
        app_id: data.app_id,
        app_secret: data.app_secret,
        user_id: data.user_id,
        user_secret: data.user_secret,
        session: data.session,
        expires_in: data.expires_in
      }),
      token_type: 'Bearer',
      issued: data.issued,
      expires_in: data.expires_in
    }
  }

  function decode (accessToken) {
    var token = AccessToken.decode(accessToken)
    if (token.type !== ACCESS_TOKEN) {
      throw new Error('Invalid token')
    }
    if (token.issued === null) {
      throw new Error('Invalid token')
    }
    if (isExpired(token)) {
      throw new Error('Error validating token: Token has been expired')
    }
    delete token.type
    return token
  }

  function refresh (refreshToken) {
    var token = AccessToken.decode(refreshToken)
    if (token.type !== REFRESH_TOKEN) {
      throw new Error('Invalid token')
    }
    return create(token)
  }

  return {
    create: create,
    decode: decode,
    refresh: refresh
  }
}
