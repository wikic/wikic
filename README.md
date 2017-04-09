Wikic
---

[![Build Status](https://travis-ci.org/dgeibi/wikic.svg?branch=master)](https://travis-ci.org/dgeibi/wikic) [![Coveralls](https://img.shields.io/coveralls/dgeibi/wikic.svg)](https://coveralls.io/github/dgeibi/wikic)

a simple static document generator

## Getting started

### Installation

``` bash
npm install --save dgeibi/wikic

#or

yarn add dgeibi/wikic
```

### Configuration and Front Matter

[Default Config](lib/defaultConfig.yml)

You can create `_config.yml` to override defaultConfig.The `_config.yml` in `wikic.cwd` will be loaded as global config. The `_config.yml` closest to markdown will override config. Front Matter in each markdown will override `config.page` respectively.

Front Matter example:

``` yaml
---
title: Hello World # title of page
toc: false # disable toc for this page
layout: docs # set layout for this page
hide: true # hide this page from docs list(only necessary for file in docsPath)
---
```

### Layouts

You can create [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates (extname is `.njk`) in `layoutPath` and set `page.layout` or `layout` in front matter to template's filename.

## Example

- [dgeibi/note](https://github.com/dgeibi/note)

### Usage

``` javascript
const htmlclean = require('htmlclean')
const Wikic = require('wikic')

const wikic = new Wikic()

// add plugin to minify html before write
wikic.beforeWrite((context) => {
  if (!context.data) return context
  const html = htmlclean(context.data)
  return Object.assign({}, context, { data: html })
})

// build the site and start watcher and server to debug or preview
wikic.build().then(() => wikic.watch().serve())
```

## API

### Wikic([cwd])

Creates a Wikic

``` javascript
const wikic = new Wikic()
```

You can pass a String to set `wikic.cwd`.

``` javascript
const wikic = new Wikic('path/to')
```

### wikic.setup([cwd])

- cwd: String, working dir, default value is `wikic.cwd || process.cwd()`
- Returns: `this`

Reloads configurations and layouts.

### wikic.clean()

- Returns a `Promise`

Cleans all the files in `publicPath`

### wikic.build()

- Returns a `Promise`

Builds both Files in `docsPath` and `root`

### wikic.beforeWrite(plugin)

- plugin: Function
- Returns `this`

Pushes a plugin into task queue in which plugin will be executed before writing each markdown file in order.

The plugin should receive a context and return a context.

``` javascript
wikic.beforeWrite((context) => {
  if (!context.data) return context
  const html = htmlclean(context.data)
  return Object.assign({}, context, { data: html })
})
```

### wikic.afterRead(plugin)

- plugin: Function
- Returns `this`

Pushes a plugin into task queue in which plugin will be executed after reading each markdown file in order.

### wikic.watch()

- Returns `this`

Watches file change and run `wikic.build()` when changed

### wikic.serve()

- Return `this`

Serves the files in PublicPath

### wikic.typeMap(key)

- key: String
- Returns typeName(a String) set in config.typeMap

### wikic.getURL(url)

- url: String, path that relative to root
- Returns a absolute URL prefixed with base URL

## Thanks

- [xcatliu/pagic](https://github.com/xcatliu/pagic)
- [jonschlinkert/html-toc](https://github.com/jonschlinkert/html-toc)
- [Adrian Mejia Blog](http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/)
- ...

## LICENSE

[MIT](LICENSE)
