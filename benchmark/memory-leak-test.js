var options = {
  salt: 'some_random_string',
  ttl: 86400,
  checkAppSecret: function (userId, userSecret, cb) {
    return Promise.resolve(true)
  },
  checkUserSecret: function (userId, userSecret, cb) {
    cb(null, true)
  },
  checkSession: function (sessionId, cb) {
    return Promise.resolve(true)
  }
}

var OauthToken = require('..')(options)

var data = {
  appId: 'my_app',
  appSecret: '9iZp4FqiubL6',
  userId: '198623486',
  userSecret: '1HMuXS5KBTWQ',
  session: 'QxBfjfUQsD66'
}

const pickAccessToken = (token) => token.access_token
const pickRefreshToken = (token) => token.refresh_token

var cycles = 0

function cycle (data) {
  cycles++
  return OauthToken
    .create(data)
    .then(pickRefreshToken)
    .then(OauthToken.refresh)
    .then(pickAccessToken)
    .then(OauthToken.decode)
    .then(cycle)
}

setInterval(function () {
  console.log(process.memoryUsage(), cycles)
}, 1000)

cycle(data)
