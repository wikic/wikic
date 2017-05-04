const http = require('http');
const url = require('url');
const fsp = require('fs-promise');
const path = require('path');
const getPort = require('get-port');

const logger = require('./log');
const mimeType = require('./mimeType');

/* eslint-disable no-param-reassign */

module.exports = async ({ getCwd = () => process.cwd(), getBaseurl = () => '', port = 4000 }) => {
  const host = 'http://127.0.0.1';
  let cachedBaseurl = getBaseurl();
  let cwd = getCwd();
  let server;

  port = parseInt(port, 10);
  const cachedPort = await getPort(port);

  if (cachedPort !== port) logger.warn(`Port ${port} is not available. Use ${cachedPort} instead.`);
  server = http.createServer(async (req, res) => {
    const baseurl = getBaseurl();
    const rootURL = url.resolve(`${host}:${cachedPort}/`, `${baseurl}/`);
    cwd = getCwd();
    if (cachedBaseurl !== baseurl) {
      logger.verbose(`Serving at ${rootURL}`);
      cachedBaseurl = baseurl;
    }

    logger.verbose(`${req.method} ${req.url}`);

    if (req.url.indexOf(`/${baseurl}`) !== 0) {
      res.statusCode = 404;
      res.setHeader('Content-type', 'text/html');
      res.end(`The site is serving at <a href="${rootURL}">${rootURL}</a>`);
      return;
    }

    let pathname = path.join(
      cwd,
      url.parse(req.url).pathname.replace(new RegExp(`^/${baseurl}/?`), '')
    );

    try {
      await fsp.access(pathname);
    } catch (e) {
      res.statusCode = 404;
      pathname = path.resolve(cwd, '404.html');
      try {
        await fsp.access(pathname);
      } catch (err) {
        res.end();
        return;
      }
    }

    const stats = await fsp.stat(pathname);

    if (stats.isDirectory()) {
      pathname = path.resolve(pathname, 'index.html');
    }

    try {
      const data = await fsp.readFile(pathname);
      const ext = path.parse(pathname).ext;
      res.setHeader('Content-type', mimeType[ext] || 'text/plain');
      res.end(data);
    } catch (err) {
      res.statusCode = 500;
      res.end(`Error getting the file: ${err}.`);
    }
  });

  return {
    get port() {
      return cachedPort;
    },

    get cwd() {
      return cwd;
    },

    close(cb) {
      server.close(cb);
      server = null;
      return this;
    },

    listen() {
      server.listen(cachedPort);
      logger.verbose(`Serving at ${url.resolve(`${host}:${cachedPort}/`, `${cachedBaseurl}/`)}`);
      return this;
    },
  };
};
