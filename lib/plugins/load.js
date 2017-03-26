const fsp = require('fs-promise')
const loadConfig = require('./loadConfig')

module.exports = async (from, defaultConfig) => {
  const [data, config] = await Promise.all([
    fsp.readFile(from, { encoding: 'utf8' }),
    loadConfig(from, defaultConfig),
  ])
  return { data, config }
}
