'use strict'

var path = require('path')
var crypto = require('crypto')
var bs58 = require('bs58')
var ProtoBuf = require('protobufjs')

var builder = ProtoBuf.loadProtoFile(path.join(__dirname, 'schema.proto'))
var AccessToken = builder.build('AccessToken')

module.exports = function (salt) {
  salt = salt || ''

  function getDigest (buf) {
    return crypto.createHmac('md5', salt).update(buf).digest()
  }

  function checkDigest (buf, digest) {
    var hmac = crypto.createHmac('md5', salt).update(buf).digest()
    if (digest.compare(hmac) !== 0) {
      throw new Error('Error validating token: Invalid token signature.')
    }
  }

  return {
    TokenType: AccessToken.TokenType,

    encode: function encode (data) {
      var accessToken = new AccessToken(data)
      var tokenBuffer = accessToken.encode().toBuffer()
      var digest = getDigest(tokenBuffer)
      return bs58.encode(Buffer.concat([ tokenBuffer, digest ]))
    },

    decode: function decode (accessToken) {
      try {
        var buf = new Buffer(bs58.decode(accessToken))
      } catch (err) {
        throw new Error('Error validating token: Malformed token.')
      }
      var tokenBuffer = buf.slice(0, buf.length - 16)
      var digest = buf.slice(buf.length - 16, buf.length)
      checkDigest(tokenBuffer, digest)

      return AccessToken.decode(tokenBuffer)
    }
  }
}
