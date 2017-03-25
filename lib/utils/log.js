const winston = require('winston')

const dirname = process.cwd()
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, level: 'verbose' }),
    new (winston.transports.File)({ filename: `${dirname}/.debug.log`, timestamp: true, json: true, level: 'verbose' }),
  ],
})

module.exports = logger
