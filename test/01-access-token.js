'use strict'

var expect = require('chai').expect
var AccessToken = require('../lib/access-token')()

describe('AccessToken schema', function () {
  it('TokenType exists', function () {
    expect(AccessToken).to.have.deep.property('TokenType.ACCESS_TOKEN')
    expect(AccessToken).to.have.deep.property('TokenType.REFRESH_TOKEN')
  })

  it('Missing required userId', function () {
    var data = {
      type: AccessToken.TokenType.ACCESS_TOKEN
    }
    expect(AccessToken.encode.bind(AccessToken, data)).to.throw(/(missing).*(userId)/i)
  })

  it('Minimal token', function () {
    var data = {
      type: AccessToken.TokenType.ACCESS_TOKEN,
      userId: '123'
    }
    expect(AccessToken.encode(data)).to.be.a('string')
  })

  it('Full token', function () {
    var data = {
      type: AccessToken.TokenType.ACCESS_TOKEN,
      appId: 'app_id',
      appSecret: 'app_secret',
      userId: 'user_id',
      userSecret: 'user_secret',
      session: 'session',
      issued: 1477745764,
      ttl: 3600
    }
    expect(AccessToken.encode(data)).to.be.a('string')
  })

  it('Access token is decodable', function () {
    var data = {
      type: AccessToken.TokenType.ACCESS_TOKEN,
      userId: '123'
    }
    var accessToken = AccessToken.encode(data)
    var token = AccessToken.decode(accessToken)

    expect(token).to.be.an('object')
    expect(token).to.have.property('type', AccessToken.TokenType.ACCESS_TOKEN)
    expect(token).to.have.property('userId', '123')

    delete token.type
    delete token.userId

    // All other keys have to be null
    Object.keys(token).forEach(function (key) {
      expect(token[ key ]).to.be.null
    })
  })

  it('Backward compatibility', function () {
    var accessToken = 'G47cFiMRD5SXRoqQsVqY3RyxvoB9fYePSmX614rjgaZfLJ8TxatxdBTDB4qTBeeXzyaaSC6WJPPYm2GxoLysinHmFa5khBbC6LGZ37LNaP'
    var expected = {
      type: AccessToken.TokenType.ACCESS_TOKEN,
      appId: 'app_id',
      appSecret: 'app_secret',
      userId: 'user_id',
      userSecret: 'user_secret',
      session: 'session',
      issued: 1477745764,
      ttl: 3600
    }

    // deep equal does not work ... why?
    var token = AccessToken.decode(accessToken)
    Object.keys(expected).forEach(function (key) {
      expect(token[ key ]).to.be.equal(expected[ key ])
    })
  })
})
