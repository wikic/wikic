const fixUnderscores = require('../utils/fix-underscores')

module.exports = (config) => {
  const { excludes, publicPath, publicExcludes, docsPath } = config
  return [
    `${publicPath}/**`,
    '**/node_modules/**',
    'wikic.config.js',
    '**/_*',
    ...(excludes || []),
    ...(publicExcludes || []),
    fixUnderscores(docsPath),
  ]
}
