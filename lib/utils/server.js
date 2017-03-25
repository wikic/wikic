const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
const logger = require('./log')
const mimeType = require('./mimeType')

module.exports = ({
  cwd = () => process.cwd(),
  baseurl = () => '',
  port = 4000,
}) => {
  const server = http.createServer((req, res) => {
    logger.verbose(`${req.method} ${req.url}`)
    if (req.url.indexOf(`/${baseurl()}`) !== 0) {
      res.statusCode = 404 // eslint-disable-line no-param-reassign
      res.end(`File ${req.url} not found!`)
      return
    }
    const parsedUrl = url.parse(req.url)
    let pathname = path.join(cwd(), parsedUrl.pathname.replace(new RegExp(`^/${baseurl()}/?`), ''))

    fs.exists(pathname, (exist) => {
      if (!exist) {
        res.statusCode = 404 // eslint-disable-line no-param-reassign
        pathname = `${cwd()}/404.html`
        if (!fs.existsSync(pathname)) {
          res.end()
          return
        }
      }

      if (fs.statSync(pathname).isDirectory()) {
        pathname += '/index.html'
      }

      fs.readFile(pathname, (err, data) => {
        if (err) {
          res.statusCode = 500 // eslint-disable-line no-param-reassign
          res.end(`Error getting the file: ${err}.`)
        } else {
          const ext = path.parse(pathname).ext
          res.setHeader('Content-type', mimeType[ext] || 'text/plain')
          res.end(data)
        }
      })
    })
  })
  server.listen(parseInt(port, 10))
  logger.verbose(`Serving at http://127.0.0.1:${port}`)
  return server
}

/* http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/ */
