module.exports = (config) => {
  const { excludes, docsPath, publicPath, publicExcludes } = config
  return [
    `${publicPath}/**`,
    `${docsPath}/**`,
    '_*/**',
    '**/node_modules/**',
    'wikic.config.js',
    ...(excludes || []),
    ...(publicExcludes || []),
  ]
}
