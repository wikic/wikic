const logger = require('../utils/log')
const load = require('../filters/load')
const fse = require('fs-extra')
const path = require('path')
const urlRelative = require('../utils/urlRelative')
const { _extend: assign } = require('util')

module.exports = (wikic) => {
  const builder = {}

  builder.buildMD = oContext =>
    builder
      .readMD(oContext)
      .then(builder.renderMD)
      .then(builder.writeMD)
      .catch(logger.error)

  builder.readMD = async (oContext) => {
    const context = await load(oContext)
    const { dist, page: oPage } = context

    const page = oPage || {}
    page.address = wikic.getURL(
      path
        .relative(wikic.publicPath, dist)
        .split(path.sep)
        .join('/')
    )
    context.page = page
    return wikic.filter.exec('afterRead', context, wikic)
  }

  builder.writeMD = async (context) => {
    const newContext = await wikic.filter.exec('beforeWrite', context, wikic)
    const { dist, data } = newContext
    await fse.outputFile(dist, data)
    return newContext
  }

  builder.renderMD = async (context) => {
    const newContext = await wikic.filter.exec('beforeRender', context, wikic)
    const { data: oData, page, renderContext } = newContext
    const { address, layout } = page
    renderContext.content = oData

    wikic.renderer.addFilter('relative', to => urlRelative(address, to))
    const data = wikic.renderer.render(`${layout}.njk`, renderContext)

    return assign(newContext, { data })
  }

  builder.readDoc = (filePath) => {
    const src = path.join(wikic.docsPath, filePath)
    const types = path.dirname(filePath).split(path.sep)
    const targetRelative = filePath.replace(/\.md$/, '.html')
    const dist = path.join(wikic.publicPath, targetRelative)
    const site = assign({}, wikic.config)
    const page = { types }

    return builder.readMD({
      src,
      dist,
      site,
      page,
      IS_DOC: true,
      configCaches: wikic.configCaches,
    })
  }

  builder.buildAsset = async ({ src, dist }) => {
    const site = assign({}, wikic.config)
    const data = await fse.readFile(src)

    const { dist: finalDist, data: finalData } = await wikic.filter.exec(
      'beforeWriteAsset',
      { src, dist, data, site },
      this
    )
    if (!finalDist) return logger.warn(`${src}'s dist_dir is empty.`)
    if (!finalData) return logger.warn(`${src}'s output is empty.`)
    await fse.ensureFile(finalDist)
    return fse.writeFile(finalDist, finalData)
  }

  return builder
}
