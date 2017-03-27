const load = require('./load')
const mdFilter = require('./mdFilter')
const fmFilter = require('./fmFilter')
const fsp = require('fs-promise')
const renderer = require('./renderer')
const logger = require('../utils/log')

/**
 * from: fullPath
 */

/**
 * to: fullPath
 */


class Kit {
  constructor() {
    this.afterReadingFuncs = [fmFilter, mdFilter]
    this.beforeWritingCallbacks = []
  }

  afterReading(func) {
    if (typeof func === 'function') this.afterReadingFuncs.push(func)
  }

  beforeWriting(func) {
    if (typeof func === 'function') this.beforeWritingCallbacks.push(func)
  }

  static isMarkdown(file) {
    return /\.md$/.test(file)
  }

  static renderMD({ data, config }) {
    const layout = config.attributes.layout || config.layout
    const title = config.attributes.title
    const page = { title }
    const html = renderer.render(`${layout}.njk`, {
      content: data,
      page,
    })
    return html
  }

  writeMD(to, html) {
    return this.beforeWritingCallbacks
      .reduce((promise, callback) => promise.then(callback), Promise.resolve(html))
      .then(newHTML => fsp.outputFile(to, newHTML))
      .catch(logger.error)
  }

  readMD(from, config) {
    const promiseRead = load(from, config).catch(logger.error)
    return this.afterReadingFuncs
      .reduce((promise, callback) => promise.then(callback), promiseRead)
      .catch(logger.error)
  }
}

module.exports = Kit
