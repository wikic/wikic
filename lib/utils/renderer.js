const nunjucks = require('nunjucks')

let nunjucksEnv = null

exports.configure = (...arg) => {
  nunjucksEnv = nunjucks.configure(...arg)
}

Object.defineProperty(exports, 'env', {
  get() { return nunjucksEnv },
  configurable: false,
})

Object.defineProperty(exports, 'render', {
  get() {
    if (!nunjucksEnv) throw new Error('configure first!')
    return nunjucksEnv.render.bind(nunjucksEnv)
  },
  configurable: false,
})
