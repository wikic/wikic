/* ignores all the files start _ (excludes layoutPath and docsPath) */
module.exports = (wikic) => {
  const ignored = [
    /(^|[/\\])\../,
    `${wikic.config.publicPath}/**`,
    '**/node_modules/**',
    ...(wikic.config.excludes || []),
    ...(wikic.config.watchExcludes || []),
  ]

  const underScores = []
  ;[wikic.config.layoutPath, wikic.config.docsPath].forEach((pathname) => {
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
