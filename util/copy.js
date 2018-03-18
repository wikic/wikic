const { copySync } = require('fs-extra/lib/copy-sync')

copySync(...process.argv.slice(2))
