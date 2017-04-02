const http = require('http')
const url = require('url')
const fsp = require('fs-promise')
const path = require('path')
const logger = require('./log')
const mimeType = require('./mimeType')

const host = 'http://127.0.0.1'
let server
let cachedBaseurl
let cachedPort
/* eslint-disable no-param-reassign */

module.exports = {
  close(cb) {
    server.close(cb)
    server = null
    return this
  },

  listen() {
    if (typeof server === 'undefined') throw Error('expect server created')
    server.listen(parseInt(cachedPort, 10))
    logger.verbose(`Serving at ${url.resolve(`${host}:${cachedPort}/`, `${cachedBaseurl}/`)}`)
    return this
  },

  create({ getCwd = () => process.cwd(), getBaseurl = () => '', port = 4000 }) {
    cachedPort = port
    cachedBaseurl = getBaseurl()
    this.cwd = getCwd()
    server = http.createServer(async (req, res) => {
      const baseurl = getBaseurl()
      const rootURL = url.resolve(`${host}:${port}/`, `${baseurl}/`)
      this.cwd = getCwd()
      if (cachedBaseurl !== baseurl) {
        logger.verbose(`Now, serving at ${rootURL}`)
        cachedBaseurl = baseurl
      }

      logger.verbose(`${req.method} ${req.url}`)

      if (req.url.indexOf(`/${baseurl}`) !== 0) {
        res.statusCode = 404
        res.setHeader('Content-type', 'text/html')
        res.end(`The site is serving at <a href="${rootURL}">${rootURL}</a>`)
        return
      }

      let pathname = path.join(this.cwd, url.parse(req.url).pathname.replace(new RegExp(`^/${baseurl}/?`), ''))

      try {
        await fsp.access(pathname)
      } catch (e) {
        res.statusCode = 404
        pathname = `${this.cwd}/404.html`
        try {
          await fsp.access(pathname)
        } catch (err) {
          res.end()
          return
        }
      }

      const stats = await fsp.stat(pathname)

      if (stats.isDirectory()) {
        pathname = path.resolve(pathname, 'index.html')
      }

      try {
        const data = await fsp.readFile(pathname)
        const ext = path.parse(pathname).ext
        res.setHeader('Content-type', mimeType[ext] || 'text/plain')
        res.end(data)
      } catch (err) {
        res.statusCode = 500
        res.end(`Error getting the file: ${err}.`)
      }
    })
    return this
  },
}

/* http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/ */

