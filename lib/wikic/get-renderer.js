const nunjucks = require('nunjucks')

module.exports = ({ layoutPath, getURL, typeMap, config: { watch } }) => {
  const renderer = nunjucks.configure(layoutPath, {
    trimBlocks: true,
    autoescape: true,
    watch,
  })
  renderer.addFilter('baseurl', getURL)
  renderer.addFilter('typeMap', typeMap)
  renderer.addFilter('typeMaps', arr => arr.map(key => typeMap(key)))
  return renderer
}
