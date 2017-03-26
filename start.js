const Wikic = require('./index')

const wikic = new Wikic('./source')

wikic.render()
  .then(w => w.watch())
  .then(w => w.serve())
