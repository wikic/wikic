const Wikic = require('./index')

const wikic = new Wikic('./example')

wikic.render()
  .then(w => w.watch())
  .then(w => w.serve())
