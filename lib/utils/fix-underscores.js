/* return glob pattern start with _ (excludes what in tofixes) */
module.exports = (...tofixes) => {
  const underScores = []
  tofixes.forEach(pathname => {
    if (/^_.+/.test(pathname)) {
      underScores.push(pathname.replace(/^_/, ''))
    }
  })

  return underScores.length > 0 ? `_!(${underScores.join('|')})/**` : '_*/**'
}
