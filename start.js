const Wikic = require('./index')

const wikic = new Wikic('./example')

wikic.build()
  .then(w => w.watch())
  .then(w => w.serve())
