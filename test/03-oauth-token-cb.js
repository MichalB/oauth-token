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

var APP_SECRET = 'app_secret'
var USER_SECRET = 'user_secret'
var SESSION = 'session'

function checkAppSecret (appId, appSecret, cb) {
  cb(null, appSecret === APP_SECRET)
}

function checkUserSecret (userId, userSecret, cb) {
  cb(null, userSecret === USER_SECRET)
}

function checkSession (sessionId, cb) {
  cb(null, sessionId === SESSION)
}

describe('Oauth token (callback version)', function () {
  it('Pass create token', function (done) {
    var data = {
      appId: 'app_id',
      appSecret: APP_SECRET,
      userId: 'user_id',
      userSecret: USER_SECRET,
      session: SESSION
    }
    OauthToken.create(data, function (err, token) {
      expect(err).to.not.exist
      expect(token).to.exist
      done()
    })
  })

  it('Fail create token', function (done) {
    var data = {}
    OauthToken.create(data, function (err, token) {
      expect(err).to.exist
      expect(token).to.not.exist
      done()
    })
  })

  it('Pass decode token', function (done) {
    var data = {
      appId: 'app_id',
      appSecret: APP_SECRET,
      userId: 'user_id',
      userSecret: USER_SECRET,
      session: SESSION
    }
    OauthToken.create(data, function (err, token) {
      expect(err).to.not.exist

      OauthToken.decode(token.access_token, function (err, decoded) {
        expect(err).to.not.exist
        expect(decoded).to.exist
        done()
      })
    })
  })

  it('Fail decode token', function (done) {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 10
    }
    OauthToken.create(data, function (err, token) {
      expect(err).to.not.exist

      OauthToken.decode(token.access_token, function (err, decoded) {
        expect(err).to.exist
        expect(decoded).to.not.exist
        done()
      })
    })
  })

  it('Fail verifying token', function (done) {
    var data = {
      userId: 'user_id',
      userSecret: 'old_secret'
    }
    OauthToken.create(data, function (err, token) {
      expect(err).to.not.exist

      OauthToken.decode(token.access_token, function (err, decoded) {
        expect(err).to.exist
        expect(decoded).to.not.exist
        done()
      })
    })
  })

  it('Pass refresh token', function (done) {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 10
    }
    OauthToken.create(data, function (err, token) {
      expect(err).to.not.exist

      OauthToken.refresh(token.refresh_token, function (err, refreshed) {
        expect(err).to.not.exist
        expect(refreshed).to.exist
        done()
      })
    })
  })

  it('Fail refresh token', function (done) {
    var data = {
      userId: 'user_id',
      issued: 1477745764,
      ttl: 10
    }
    OauthToken.create(data, function (err, token) {
      expect(err).to.not.exist

      OauthToken.refresh(token.access_token, function (err, refreshed) {
        expect(err).to.exist
        expect(refreshed).to.not.exist
        done()
      })
    })
  })
})
