const nunjucks = require('nunjucks')

let nunjucksEnv = null

module.exports = {
  configure(...arg) {
    nunjucksEnv = nunjucks.configure(...arg)
  },

  get env() {
    return nunjucksEnv
  },

  get render() {
    if (!nunjucksEnv) throw new Error('configure first!')
    return nunjucksEnv.render.bind(nunjucksEnv)
  },
}
