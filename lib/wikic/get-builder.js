const logger = require('../utils/log')
const loadData = require('./loadData')
const fse = require('fs-extra')
const dotProp = require('dot-prop')
const path = require('path')
const urlRelative = require('../utils/urlRelative')
const { assign } = require('lodash')

module.exports = wikic => {
  const builder = {}

  const setAddress = context => {
    context.page = dotProp.set(
      context.page || {},
      'address',
      wikic.getURL(
        path
          .relative(wikic.publicPath, context.dist)
          .split(path.sep)
          .join('/')
      )
    )
  }

  builder.buildMD = oContext =>
    builder
      .readMD(oContext)
      .then(builder.renderMD)
      .then(builder.writeMD)
      .catch(logger.error)

  builder.readMD = async init => {
    assign(init, {
      site: wikic._site,
      configCaches: wikic.configCaches,
    })
    const context = await loadData(init)
    setAddress(context)
    return wikic.filter.exec('afterRead', context, wikic)
  }

  builder.writeMD = async context => {
    const newContext = await wikic.filter.exec('beforeWrite', context, wikic)
    const { dist, data } = newContext
    await fse.outputFile(dist, data)
    return newContext
  }

  builder.renderMD = async context => {
    const newContext = await wikic.filter.exec('beforeRender', context, wikic)
    const { data: oData, page, renderContext } = newContext
    const { address, layout } = page
    renderContext.content = oData

    wikic.renderer.addFilter('relative', to => urlRelative(address, to))
    const data = wikic.renderer.render(`${layout}.njk`, renderContext)

    return assign(newContext, { data })
  }

  builder.readDoc = filePath => {
    const src = path.join(wikic.docsPath, filePath)
    const types = path.dirname(filePath).split(path.sep)
    const targetRelative = filePath.replace(/\.md$/, '.html')
    const dist = path.join(wikic.publicPath, targetRelative)
    const page = { types }

    return builder.readMD({
      src,
      dist,
      page,
      IS_DOC: true,
    })
  }

  builder.buildAsset = async ({ src, dist }) => {
    const data = await fse.readFile(src)
    const { dist: finalDist, data: finalData } = await wikic.filter.exec(
      'beforeWriteAsset',
      {
        src,
        dist,
        data,
        site: assign({}, wikic._site),
        configCaches: wikic.configCaches,
      },
      this
    )
    if (!finalDist) return logger.warn(`${src}'s dist_dir is empty.`)
    if (!finalData) return logger.warn(`${src}'s output is empty.`)
    await fse.ensureFile(finalDist)
    return fse.writeFile(finalDist, finalData)
  }

  return builder
}
