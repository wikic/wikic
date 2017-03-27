const fsp = require('fs-promise')
const path = require('path')
const htmlclean = require('htmlclean')

const findDocs = require('../utils/findDocs')
const logger = require('../utils/log')

const getList = require('../views/getList')
const getNav = require('../views/getNav')
const addTOC = require('../views/addTOC')

const { readMD, writeMD } = require('../plugins/mdKit')

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

const writeIndex = function writeIndex(dir) {
  const dirname = dir.slice(0, dir.length - 1)
  const types = dirname.split('/')
  const target = path.join(this.publicPath, dirname, 'index.html')
  const address = path.join('/', dirname, '/')
  const config = Object.assign({}, this.config, { types, address })
  const render = renderIndex.bind(this)
  return Promise.resolve({ config })
    .then(render)
    .then(htmlclean)
    .then(html => fsp.outputFile(target, html))
    .catch(e => logger.error(e))
}

const renderDocs = function renderDocs({ data, config }) {
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

const writeDocs = async function writeDocs(file) {
  const targetRelative = file.replace(/\.md$/, '.html')

  const from = path.join(this.docsPath, file)
  const to = path.join(this.publicPath, targetRelative)

  const types = path.dirname(file).split('/')
  const address = path.join('/', targetRelative)
  const config = Object.assign({}, this.config, { types, address })
  const result = await readMD(from, config)

  const render = renderDocs.bind(this)

  const html = await Promise.resolve(result)
    .then(this.fillInfo)
    .then(render)
    .then(addTOC)
  await writeMD(to, html)
}

module.exports = { writeIndex, renderIndex, writeDocs, renderDocs }
