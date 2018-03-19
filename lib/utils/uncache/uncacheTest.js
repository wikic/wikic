const assert = require('assert')

const uncache = require('.')
const { resolve } = require('path')

let count = 0
const beforeDelete = () => {
  count += 1
}
require('./_test_res_/a')
require('./_test_res_/b')

uncache(resolve(__dirname, './_test_res_/a'), beforeDelete)
uncache(resolve(__dirname, './_test_res_/b'), beforeDelete)

assert(count === 2)
