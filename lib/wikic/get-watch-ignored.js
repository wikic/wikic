/* ignores all the files start _ (excludes layoutPath and docsPath) */
const fixUnderscores = require('../utils/fix-underscores')

module.exports = config => [
  /(^|[/\\])\../,
  `${config.publicPath}/**`,
  '**/node_modules/**',
  ...(config.excludes || []),
  ...(config.watchExcludes || []),
  fixUnderscores(config.layoutPath, config.docsPath),
]
