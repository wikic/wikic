module.exports = (config) => {
  const { excludes, publicPath, publicExcludes } = config
  return [
    `${publicPath}/**`,
    '_*/**',
    '**/node_modules/**',
    'wikic.config.js',
    ...(excludes || []),
    ...(publicExcludes || []),
  ]
}
