const path = require('path')

const addTOC = require('./addTOC')

const findDocs = require('../utils/findDocs')
const logger = require('../utils/log')

const getList = require('../views/getList')
const getNav = require('../views/getNav')

const renderIndex = function renderIndex(context) {
  const { config } = context
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
  return Object.assign(context, { data: newData })
}

const makeIndex = function makeIndex(dir) {
  const dirname = dir.slice(0, dir.length - 1)
  const types = dirname.split('/')
  const to = path.join(this.publicPath, dirname, 'index.html')
  const address = path.join('/', dirname, '/')
  const config = Object.assign({}, this.config, { types, address })
  const render = renderIndex.bind(this)
  return Promise.resolve({ config, to })
    .then(render)
    .then(this.writeMD)
    .catch(logger.error)
}

const renderDoc = function renderDocs(context) {
  const { data, config } = context
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
  return Object.assign(context, { data: html })
}

const makeDoc = function makeDoc(file) {
  const targetRelative = file.replace(/\.md$/, '.html')

  const from = path.join(this.docsPath, file)
  const to = path.join(this.publicPath, targetRelative)

  const types = path.dirname(file).split('/')
  const address = path.join('/', targetRelative)
  const config = Object.assign({}, this.config, { types, address })
  const render = renderDoc.bind(this)

  return this.readMD({ from, to, config })
    .then(this.fillInfo)
    .then(render)
    .then(addTOC)
    .then(this.writeMD)
    .catch(logger.error)
}

module.exports = { makeDoc, makeIndex, renderIndex, renderDoc }
