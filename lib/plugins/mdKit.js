const load = require('./load')
const mdFilter = require('./mdFilter')
const fmFilter = require('./fmFilter')
const fsp = require('fs-promise')
const htmlclean = require('htmlclean')

/**
 * from: fullPath
 */
exports.readMD = function readMD(from, config) {
  return load(from, config)
    .then(fmFilter)
    .then(mdFilter)
}

/**
 * to: fullPath
 */
exports.writeMD = async (to, html) => {
  const cleanhtml = htmlclean(html)
  await fsp.outputFile(to, cleanhtml)
}

exports.isMarkdown = file => /\.md$/.test(file)

exports.renderMD = function renderMD({ data, config }, renderer) {
  const layout = config.attributes.layout || config.layout
  const title = config.attributes.title
  const page = { title }
  const html = renderer.render(`${layout}.njk`, {
    content: data,
    page,
  })
  return html
}
