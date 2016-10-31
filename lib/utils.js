'use strict'

var Promise = require('bluebird')

exports.resolve = function resolve () {
  // first argument is function to call
  // others are parameters
  var args = Array.prototype.slice.call(arguments)
  var fn = args.shift()

  return new Promise(function (resolve, reject) {
    args.push(function cb (err, res) {
      if (err && reject) {
        reject(err)
      } else if (resolve) {
        resolve(res)
      }
    })

    var promise = fn.apply(fn, args)
    if (promise && typeof promise.then === 'function') {
      promise.then(resolve).catch(reject)
    }
  })
}
