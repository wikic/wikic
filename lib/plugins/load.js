const fsp = require('fs-promise')
const loadConfig = require('./loadConfig')

module.exports = async ({ fileFullPath, defaultConfig, configFileName }) => {
  const [data, config] = await Promise.all([
    fsp.readFile(fileFullPath, { encoding: 'utf8' }),
    loadConfig({ fileFullPath, defaultConfig, configFileName }),
  ])
  return { data, config }
}
