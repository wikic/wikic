const fsp = require('fs-promise')
const loadConfig = require('../utils/loadConfig')

module.exports = async (context) => {
  const [data, config] = await Promise.all([
    fsp.readFile(context.from, { encoding: 'utf8' }),
    loadConfig(context.from, context.config),
  ])
  return Object.assign(context, { data, config })
}
