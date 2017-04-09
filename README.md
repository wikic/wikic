# Wikic

[![Build Status][build-badge]][build]
[![Coveralls][coverage-badge]][coverage]
[![MIT License][license-badge]][license]
[![version][version-badge]][package]
[![Node][node-badge]][node]

a simple static site generator

## Getting started

### Installation

``` bash
npm install --save wikic

#or

yarn add wikic
```

### Configuration and Front Matter

[Default Config](lib/defaultConfig.yml)

You can create `_config.yml`(s) to override defaultConfig. The `_config.yml` in `wikic.cwd` will be loaded as global config. The `_config.yml` closest to markdown will override config. Front Matter in each markdown will override `config.page` respectively.

Front Matter example:

``` yaml
---
title: Hello World # title of the page
toc: false # disable toc for this page
layout: docs # set layout for this page
hide: true # hide this page from docs list(only necessary for the file in docsPath)
---
```

### Layouts

You can create [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates (extname is `.njk`) in `layoutPath` and set `page.layout` or `layout` in front matter to template's filename.

#### Builtin Filter

- `typeMap`: see [wikic.typeMap(key)](#wikictypemapkey)
- `baseurl`: see [wikic.getURL(url)](#wikicgeturlurl)

#### Nunjucks in Markdown

Not support builtin filter above. Variable `site` and `page` is available. `site` is a reference of `context.config` and `page` is a shortcut for `context.config.page`.

`{{`, `}}`, `{#`, `#}`, `{%`, `%}` in raw blocks and `<code>` blocks can be escaped.

``` html
<!-- markdown -->
{% raw %}
{{ page.title }}
{% endraw %}

<!-- output -->
{{ page.title }}
```

``` html
<!-- markdown -->
`{{ page.title }}`

<!-- output -->
<code>{{ page.title }}</code>
```

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

- url: String, the path that relative to root
- Returns an absolute URL prefixed with base URL

## Thanks

- [xcatliu/pagic](https://github.com/xcatliu/pagic)
- [jonschlinkert/html-toc](https://github.com/jonschlinkert/html-toc)
- [Adrian Mejia Blog](http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/)
- ...

## LICENSE

[MIT][license]

[license]: https://raw.githubusercontent.com/dgeibi/wikic/master/LICENSE
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[coverage]: https://coveralls.io/github/dgeibi/wikic
[coverage-badge]: https://img.shields.io/coveralls/dgeibi/wikic.svg
[build]: https://travis-ci.org/dgeibi/wikic
[build-badge]: https://travis-ci.org/dgeibi/wikic.svg?branch=master
[node]: https://nodejs.org
[node-badge]: https://img.shields.io/badge/node-%3E%3D%207.0.0-brightgreen.svg
[version-badge]: https://img.shields.io/npm/v/wikic.svg
[package]: https://www.npmjs.com/package/wikic
