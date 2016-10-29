var expect = require('chai').expect
var AccessToken = require('../lib/access-token')()
var OauthToken = require('../lib/oauth-token')({ expires_in: 60 })

var NOW = Date.now()
var ISSUED = NOW / 1000 | 0
Date.now = function () {
  return NOW
}

describe('AccessToken schema', function () {
  it('TokenType exists', function () {
    expect(AccessToken).to.have.deep.property('TokenType.ACCESS_TOKEN')
    expect(AccessToken).to.have.deep.property('TokenType.REFRESH_TOKEN')
  })

  it('Missing required user_id', function () {
    var data = {
      type: AccessToken.TokenType.ACCESS_TOKEN
    }
    expect(AccessToken.encode.bind(AccessToken, data)).to.throw(/(missing).*(user_id)/i)
  })

  it('Minimal token', function () {
    var data = {
      type: AccessToken.TokenType.ACCESS_TOKEN,
      user_id: '123'
    }
    expect(AccessToken.encode(data)).to.be.a('string')
  })

  it('Full token', function () {
    var data = {
      type: AccessToken.TokenType.ACCESS_TOKEN,
      app_id: 'app_id',
      app_secret: 'app_secret',
      user_id: 'user_id',
      user_secret: 'user_secret',
      session: 'session',
      issued: 1477745764,
      expires_in: 3600
    }
    expect(AccessToken.encode(data)).to.be.a('string')
  })

  it('Access token is decodable', function () {
    var data = {
      type: AccessToken.TokenType.ACCESS_TOKEN,
      user_id: '123'
    }
    var accessToken = AccessToken.encode(data)
    var token = AccessToken.decode(accessToken)

    expect(token).to.be.an('object')
    expect(token).to.have.property('type', AccessToken.TokenType.ACCESS_TOKEN)
    expect(token).to.have.property('user_id', '123')

    delete token.type
    delete token.user_id

    // All other keys have to be null
    Object.keys(token).forEach(function (key) {
      expect(token[ key ]).to.be.null
    })
  })

  it('Backward compatibility', function () {
    var accessToken = 'G47cFiMRD5SXRoqQsVqY3RyxvoB9fYePSmX614rjgaZfLJ8TxatxdBTDB4qTBeeXzyaaSC6WJPPYm2GxoLysinHmFa5khBbC6LGZ37LNaP'
    var expected = {
      type: AccessToken.TokenType.ACCESS_TOKEN,
      app_id: 'app_id',
      app_secret: 'app_secret',
      user_id: 'user_id',
      user_secret: 'user_secret',
      session: 'session',
      issued: 1477745764,
      expires_in: 3600
    }

    // deep equal does not work ... why?
    var token = AccessToken.decode(accessToken)
    Object.keys(expected).forEach(function (key) {
      expect(token[ key ]).to.be.equal(expected[ key ])
    })
  })
})

describe('Oauth token', function () {
  it('Create token', function () {
    var data = {
      app_id: 'app_id',
      app_secret: 'app_secret',
      user_id: 'user_id',
      user_secret: 'user_secret',
      session: 'session'
    }
    var token = OauthToken.create(data)

    expect(token).to.be.an('object')
    expect(token.access_token).to.be.a('string')
    expect(token.refresh_token).to.be.a('string')
    expect(token.token_type).to.be.equal('Bearer')
    expect(token.issued).to.be.equal(ISSUED)
    expect(token.expires_in).to.be.equal(60)
  })

  it('Token is decodable', function () {
    var data = {
      app_id: 'app_id',
      app_secret: 'app_secret',
      user_id: 'user_id',
      user_secret: 'user_secret',
      session: 'session'
    }
    var token = OauthToken.create(data)
    var decoded = OauthToken.decode(token.access_token)

    // Decoded data contains the same values as original input
    Object.keys(data).forEach(function (key) {
      expect(decoded[ key ]).to.be.equal(data[ key ])
    })
  })

  it('Custom issued & expires_in', function () {
    var data = {
      user_id: 'user_id',
      issued: 1477745764,
      expires_in: 10
    }
    var token = OauthToken.create(data)

    expect(token.issued).to.be.equal(1477745764)
    expect(token.expires_in).to.be.equal(10)
  })

  it('Expired token', function () {
    var data = {
      user_id: 'user_id',
      issued: 1477745764,
      expires_in: 10
    }
    var token = OauthToken.create(data)
    expect(OauthToken.decode.bind(OauthToken, token.access_token)).to.throw(/Token has been expired/)
  })

  it('Never expired token', function () {
    var data = {
      user_id: 'user_id',
      issued: 1477745764,
      expires_in: 0
    }
    var token = OauthToken.create(data)
    OauthToken.decode(token.access_token)
  })

  it('Refresh token is not usable as access token', function () {
    var data = {
      user_id: 'user_id',
      issued: 1477745764,
      expires_in: 10
    }
    var token = OauthToken.create(data)
    expect(OauthToken.decode.bind(OauthToken, token.refresh_token)).to.throw(/Invalid token/)
  })

  it('Refresh token', function () {
    var data = {
      user_id: 'user_id',
      issued: 1477745764,
      expires_in: 10
    }
    var token = OauthToken.create(data)
    var refreshed = OauthToken.refresh(token.refresh_token)

    // Token is valid since now
    expect(refreshed.issued).to.be.equal(ISSUED)
    // Access token is usable
    OauthToken.decode(refreshed.access_token)
  })

  it('Access token is not usable as refresh token', function () {
    var data = {
      user_id: 'user_id',
      issued: 1477745764,
      expires_in: 10
    }
    var token = OauthToken.create(data)
    expect(OauthToken.refresh.bind(OauthToken, token.access_token)).to.throw(/Invalid token/)
  })

  it('Backward compatibility', function () {
    var accessToken = '4QpGEkomTJKUHVjgr3ugfAHXoB1VFAtX1QEAHnHFey68n9sBBnHksLb2rQXTn1NePCTe2dVtVrw3fXCKXsJXnw5Scpu9EMEYGcd5masrj'
    var expected = {
      app_id: 'app_id',
      app_secret: 'app_secret',
      user_id: 'user_id',
      user_secret: 'user_secret',
      session: 'session',
      issued: 1477745764,
      expires_in: 0
    }

    // deep equal does not work ... why?
    var token = OauthToken.decode(accessToken)
    Object.keys(expected).forEach(function (key) {
      expect(token[ key ]).to.be.equal(expected[ key ])
    })
  })
})
