'use strict'

var options = {
  salt: 'some_random_string',
  ttl: 60,
  checkAppSecret: checkAppSecret,
  checkUserSecret: checkUserSecret,
  checkSession: checkSession
}

var OauthToken = require('..')(options)
var expect = require('chai').expect

var NOW = Date.now()
var ISSUED = NOW / 1000 | 0
Date.now = function () {
  return NOW
}

var APP_SECRET = 'app_secret'
var USER_SECRET = 'user_secret'
var SESSION = 'session'

function checkAppSecret (appId, AppSecret) {
  return Promise.resolve(AppSecret === APP_SECRET)
}

function checkUserSecret (userId, userSecret) {
  return Promise.resolve(userSecret === USER_SECRET)
}

function checkSession (sessionId) {
  return Promise.resolve(sessionId === SESSION)
}

describe('Oauth token', function () {
  it('Create token', function () {
    var data = {
      appId: 'app_id',
      appSecret: APP_SECRET,
      userId: 'user_id',
      userSecret: USER_SECRET,
      session: SESSION
    }
    return OauthToken.create(data)
      .then(function (token) {
        expect(token).to.be.an('object')
        expect(token.access_token).to.be.a('string')
        expect(token.refresh_token).to.be.a('string')
        expect(token.token_type).to.be.equal('Bearer')
        expect(token.issued).to.be.equal(ISSUED)
        expect(token.expires_in).to.be.equal(60)
      })
  })

  it('Missing required userId', function () {
    var data = {}

    return OauthToken.create(data)
      .then(function (token) {
        expect(token).to.not.exist
      })
      .catch(function (err) {
        expect(err.message).to.match(/(missing).*(userId)/i)
      })
  })

  it('Token is decodable', function () {
    var data = {
      appId: 'app_id',
      appSecret: APP_SECRET,
      userId: 'user_id',
      userSecret: USER_SECRET,
      session: SESSION
    }

    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.decode(token.access_token)
      })
      .then(function (decoded) {
        // Decoded data contains the same values as original input
        Object.keys(data).forEach(function (key) {
          expect(decoded[ key ]).to.be.equal(data[ key ])
        })
      })
  })

  it('Custom issued & expires_in', function () {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 10
    }
    return OauthToken.create(data)
      .then(function (token) {
        expect(token.issued).to.be.equal(1477745764)
        expect(token.expires_in).to.be.equal(10)
      })
  })

  it('Expired token', function () {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 10
    }
    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.decode(token.access_token)
      })
      .then(function (decoded) {
        expect(decoded).to.not.exist
      })
      .catch(function (err) {
        expect(err.message).to.match(/Token has been expired/)
      })
  })

  it('Never expired token', function () {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 0
    }
    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.decode(token.access_token)
      })
  })

  it('Change app secret', function () {
    var data = {
      appId: 'app_id',
      appSecret: 'old_secret',
      userId: 'user_id',
      userSecret: USER_SECRET,
      session: SESSION
    }

    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.decode(token.access_token)
      })
      .then(function (decoded) {
        expect(decoded).to.not.exist
      })
      .catch(function (err) {
        expect(err.message).to.match(/Application session has been expired/)
      })
  })

  it('Change user secret', function () {
    var data = {
      appId: 'app_id',
      appSecret: APP_SECRET,
      userId: 'user_id',
      userSecret: 'old_secret',
      session: SESSION
    }

    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.decode(token.access_token)
      })
      .then(function (decoded) {
        expect(decoded).to.not.exist
      })
      .catch(function (err) {
        expect(err.message).to.match(/User session has been expired/)
      })
  })

  it('Expire login session', function () {
    var data = {
      appId: 'app_id',
      appSecret: APP_SECRET,
      userId: 'user_id',
      userSecret: USER_SECRET,
      session: 'expired_session'
    }

    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.decode(token.access_token)
      })
      .then(function (decoded) {
        expect(decoded).to.not.exist
      })
      .catch(function (err) {
        expect(err.message).to.match(/User session has been expired/)
      })
  })

  it('Refresh token is not usable as access token', function () {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 10
    }
    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.decode(token.refresh_token)
      })
      .then(function (decoded) {
        expect(decoded).to.not.exist
      })
      .catch(function (err) {
        expect(err.message).to.match(/Invalid token/)
      })
  })

  it('Refresh token', function () {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 10
    }

    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.refresh(token.refresh_token)
      })
      .then(function (refreshed) {
        // Token is valid since now
        expect(refreshed.issued).to.be.equal(ISSUED)
        // Access token is usable
        return OauthToken.decode(refreshed.access_token)
      })
  })

  it('Access token is not usable as refresh token', function () {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 10
    }
    return OauthToken.create(data)
      .then(function (token) {
        return OauthToken.refresh(token.access_token)
      })
      .then(function (refreshed) {
        expect(refreshed).to.not.exist
      })
      .catch(function (err) {
        expect(err.message).to.match(/Invalid token/)
      })
  })

  it('Backward compatibility', function () {
    var accessToken = '4QpGEkomTJKUHVjgr3ugfAHXoB1VFAtX1QEAHnHFey68n9sBBnHksLb2rQXTn1NePCTe2dVtVrw3fXCKXsJTVkTekJxuDybtxefFYoAsr'
    var expected = {
      appId: 'app_id',
      appSecret: APP_SECRET,
      userId: 'user_id',
      userSecret: USER_SECRET,
      session: SESSION,
      issued: 1477745764,
      ttl: 0
    }

    return OauthToken.decode(accessToken)
      .then(function (token) {
        // deep equal does not work ... why?
        Object.keys(expected).forEach(function (key) {
          expect(token[ key ]).to.be.equal(expected[ key ])
        })
      })
  })
})
