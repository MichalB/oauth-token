'use strict'

var Promise = require('bluebird')
var resolve = require('./utils').resolve

module.exports = function (options) {
  options = options || {}
  options.salt = options.salt || ''
  // time to live in seconds (1 hour by default)
  options.ttl = options.ttl || 3600

  var AccessToken = require('./access-token')(options.salt)
  var ACCESS_TOKEN = AccessToken.TokenType.ACCESS_TOKEN
  var REFRESH_TOKEN = AccessToken.TokenType.REFRESH_TOKEN

  function isExpired (token) {
    if (token.ttl === 0) {
      return false
    }
    return (Date.now() / 1000 | 0) > (token.issued + token.ttl)
  }

  function checkAppSecret (token) {
    if (token.appId && token.appSecret && options.checkAppSecret) {
      return resolve(options.checkAppSecret, token.appId, token.appSecret)
        .then(function (isValid) {
          if (isValid) {
            return token
          } else {
            throw new Error('Error validating token: Application session has been expired.')
          }
        })
    } else {
      return token
    }
  }

  var checkUserSecret = function (token) {
    if (token.userId && token.userSecret && options.checkUserSecret) {
      return resolve(options.checkUserSecret, token.userId, token.userSecret)
        .then(function (isValid) {
          if (isValid) {
            return token
          } else {
            throw new Error('Error validating token: User session has been expired.')
          }
        })
    } else {
      return token
    }
  }

  var checkSession = function (token) {
    if (token.session && options.checkSession) {
      return resolve(options.checkSession, token.session)
        .then(function (isValid) {
          if (isValid) {
            return token
          } else {
            throw new Error('Error validating token: User session has been expired.')
          }
        })
    } else {
      return token
    }
  }

  function create (data, cb) {
    data.issued = data.issued || Date.now() / 1000 | 0
    if (!data.hasOwnProperty('ttl')) {
      data.ttl = options.ttl
    }

    var promise = Promise
      .resolve()
      // try catch workaround
      .then(function () {
        return {
          access_token: AccessToken.encode({
            type: ACCESS_TOKEN,
            appId: data.appId,
            appSecret: data.appSecret,
            userId: data.userId,
            userSecret: data.userSecret,
            session: data.session,
            issued: data.issued,
            ttl: data.ttl
          }),
          refresh_token: AccessToken.encode({
            type: REFRESH_TOKEN,
            appId: data.appId,
            appSecret: data.appSecret,
            userId: data.userId,
            userSecret: data.userSecret,
            session: data.session,
            ttl: data.ttl
          }),
          token_type: 'Bearer',
          issued: data.issued,
          expires_in: data.ttl
        }
      })

    if (typeof cb === 'function') {
      promise.asCallback(cb)
    } else {
      return promise
    }
  }

  function decode (accessToken, cb) {
    var promise = Promise
      .resolve(AccessToken.decode(accessToken))
      .then(function (token) {
        if (token.type !== ACCESS_TOKEN) {
          throw new Error('Error validating token: Invalid token.')
        }
        if (token.issued === null) {
          throw new Error('Error validating token: Invalid token.')
        }
        if (isExpired(token)) {
          throw new Error('Error validating token: Token has been expired.')
        }
        delete token.type
        return token
      })
      .then(checkAppSecret)
      .then(checkUserSecret)
      .then(checkSession)

    if (typeof cb === 'function') {
      promise.asCallback(cb)
    } else {
      return promise
    }
  }

  function refresh (refreshToken, cb) {
    var promise = Promise
      .resolve(AccessToken.decode(refreshToken))
      .then(function (token) {
        if (token.type !== REFRESH_TOKEN) {
          throw new Error('Error validating token: Invalid token.')
        }
        return token
      })
      .then(create)

    if (typeof cb === 'function') {
      promise.asCallback(cb)
    } else {
      return promise
    }
  }

  return {
    create: create,
    decode: decode,
    refresh: refresh
  }
}
