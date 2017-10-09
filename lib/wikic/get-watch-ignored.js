/* ignores all the files start _ (excludes layoutPath and docsPath) */
module.exports = (config) => {
  const ignored = [
    /(^|[/\\])\../,
    `${config.publicPath}/**`,
    '**/node_modules/**',
    ...(config.excludes || []),
    ...(config.watchExcludes || []),
  ]

  const underScores = []
  ;[config.layoutPath, config.docsPath].forEach((pathname) => {
    if (/^_.+/.test(pathname)) {
      underScores.push(pathname.replace(/^_/, ''))
    }
  })

  if (underScores.length > 0) {
    ignored.push(`_!(${underScores.join('|')})/**`)
  } else {
    ignored.push('_*/**')
  }

  return ignored
}
