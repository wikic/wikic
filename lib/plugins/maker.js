const path = require('path')

const addTOC = require('../plugins/addTOC')

const findDocs = require('../utils/findDocs')
const logger = require('../utils/log')

const getList = require('../views/getList')
const getNav = require('../views/getNav')

const renderIndex = function renderIndex({ config }) {
  const { types, indexLayout } = config
  const collections = (types[0] === '.') ? this.docsInfos : findDocs(this.docsInfos, types)
  const content = getList(types, collections, this)
  const navbar = getNav(types, this)
  const type = types.map(this.typeMap).join(' - ')
  const newData = this.renderer.render(`${indexLayout}.njk`, {
    navbar,
    content,
    type,
  })
  return newData
}

const makeIndex = function makeIndex(dir) {
  const dirname = dir.slice(0, dir.length - 1)
  const types = dirname.split('/')
  const to = path.join(this.publicPath, dirname, 'index.html')
  const address = path.join('/', dirname, '/')
  const config = Object.assign({}, this.config, { types, address })
  const render = renderIndex.bind(this)
  return Promise.resolve({ config })
    .then(render)
    .then(html => this.kit.writeMD(to, html))
    .catch(e => logger.error(e))
}

const renderDoc = function renderDocs({ data, config }) {
  const { types, attributes } = config
  const layout = attributes.layout || config.layout
  const title = attributes.title
  const navbar = getNav(types, this)
  const type = types.map(this.typeMap).join(' - ')
  const page = { title }
  const html = this.renderer.render(`${layout}.njk`, {
    content: data,
    navbar,
    type,
    page,
  })
  return html
}

const makeDoc = function makeDoc(file) {
  const targetRelative = file.replace(/\.md$/, '.html')

  const from = path.join(this.docsPath, file)
  const to = path.join(this.publicPath, targetRelative)

  const types = path.dirname(file).split('/')
  const address = path.join('/', targetRelative)
  const config = Object.assign({}, this.config, { types, address })
  const render = renderDoc.bind(this)

  return this.kit.readMD(from, config)
    .then(this.fillInfo)
    .then(render)
    .then(addTOC)
    .then(html => this.kit.writeMD(to, html))
    .catch(logger.error)
}

module.exports = { makeDoc, makeIndex, renderIndex, renderDoc }
