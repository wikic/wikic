module.exports = (config) => {
  const { excludes, publicPath, publicExcludes } = config
  return [
    `${publicPath}/**`,
    '**/node_modules/**',
    'wikic.config.js',
    '**/_*',
    ...(excludes || []),
    ...(publicExcludes || []),
  ]
}
