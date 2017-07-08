module.exports = () => ({
  root: '.',
  docsPath: '_note',
  title: 'Wikic Demo',
  baseurl: 'wikic',
  port: 4500,
  layoutPath: '_layouts',
  publicPath: '../docs',
  excludes: ['gulpfile.js', 'index.js', 'yarn.lock', 'package.json', '**/node_modules/**'],
  typeMap: {
    css: 'CSS',
    frontend: 'FrontEnd',
    webapi: 'Web API',
    html: 'HTML',
    ecmascript: 'ECMAScript',
    '.': 'Home',
  },
  page: {
    layout: 'default',
    toc: true,
  },
  logger: {
    console: 'verbose',
    file: 'verbose',
  },
  typeNameTitleCase: true,
});
