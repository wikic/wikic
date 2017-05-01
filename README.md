# Wikic

[![Build Status][build-badge]][build]
[![Coveralls][coverage-badge]][coverage]
[![MIT License][license-badge]][license]
[![version][version-badge]][package]
[![Node][node-badge]][node]

a simple static site generator

## Example

- [dgeibi/note](https://github.com/dgeibi/note)

## Usage

``` javascript
const htmlclean = require('htmlclean')
const Wikic = require('wikic')

const wikic = new Wikic()

// add plugin to minify html before write
wikic.beforeWrite(function minify(context) {
  if (!context.data) return context
  const html = htmlclean(context.data)
  return Object.assign({}, context, { data: html })
})

// build the site and start watcher and server to debug or preview
wikic.build().then(() => wikic.watch().serve())
```

## Getting started

### Installation

``` bash
npm install --save wikic

#or

yarn add wikic
```

### Plugins

A plugin is a `Function`, which receives a `context` (Object) and returns a `context`. If a plugin is invoked, `this` in it may point to `wikic`. The context returned by a plugin will be passed to next plugin.

A `context` passed to a plugin is an Object which contains some of the following properties:

- src: string, absolute path of source
- dist: string, absolute path of destination
- data: string, content of document
- site: Object, site config
- page: Object, page config
- renderContext: Object, nunjucks render context, contains ['variables'](#variables-in-layouts)
- IS_DOC: boolean, whether in docsPath

Add a plugin by passing it to [`wikic.beforeWrite`](#wikicbeforewriteplugin) or [`wikic.afterRead`](#wikicafterreadplugin).

### Configuration and Front Matter

Default Config: [lib/defaultConfig.yml](lib/defaultConfig.yml)

You can create `_config.yml`s to override defaultConfig.

Here is an inheritance chain of configuration:

- [lib/defaultConfig.yml](lib/defaultConfig.yml),  `_config.yml` (in `wikic.cwd`) => `wikic.config`
- `wikic.config`, `_config.yml` (subdirectory of `wikic.cwd`, closest to markdown file) => `context.site`
- `context.page`, `context.site.page`, Front Matter in markdown => `context.page`

The `_config.yml` in `wikic.cwd` will be loaded as `wikic.config`.

The `_config.yml` closest to markdown will be merged into `context.site` (global config which is passed to plugins).

Front Matter in each markdown will be merged into `context.page` (page config which is passed to plugins) respectively.

Front Matter example:

``` yaml
---
title: Hello World # title of the page
toc: false # disable toc for this page
layout: docs # set layout for this page
hide: true # hide this page from docs list(necessary for the file in docsPath)
---
```

### Layouts

You can create [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates (extname is `.njk`) in `layoutPath` and set `page.layout` or `layout` in front matter to template's filename.

#### Variables in Layouts

- `site`, Object, reference to `context.site`
- `page`, Object, reference to `context.page`
    - `page.types`, Array, markdown's dirnames
- `content`, string, content of HTML built from markdown

For markdown in 'docsPath'

- `list`, string, list of documents in `docsPath`, See also [`wikic.setListTemplate(opts)`](#wikicsetlisttemplateopts)

#### Builtin Filter

- `typeMap`: see [`wikic.typeMap(key)`](#wikictypemapkey)
- `baseurl`: see [`wikic.getURL(url)`](#wikicgeturlurl)
- `typeMaps`: Receives a Array, Returns `array.map(typeMap)`. Tips: get typeNames array `{{ page.types | typeMaps }}`

#### Nunjucks in Markdown

Variable `site` and `page` is available.

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

## API

### Wikic([cwd])

Creates a Wikic

``` javascript
const wikic = new Wikic()
```

You can pass a string to set `wikic.cwd`.

``` javascript
const wikic = new Wikic('path/to')
```

### wikic.setup([cwd])

- cwd: string, working dir, default value is `wikic.cwd || process.cwd()`
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

Pushes a plugin into task queue in which plugin will be invoked before writing each markdown file in order.

See [Plugins](#plugins)

### wikic.afterRead(plugin)

- plugin: Function
- Returns `this`

Pushes a plugin into task queue in which plugin will be executed after reading each markdown file in order.

### wikic.watch()

- Returns `this`

Watches file change and run `wikic.build()` when changed

### wikic.serve()

- Returns `this`

Serves the files in PublicPath

### wikic.typeMap(key)

- key: string
- Returns typeName(a string) set in `wikic.config.typeMap`

### wikic.getURL(url)

- url: string
- Returns an absolute URL prefixed with base URL

### wikic.setListTemplate(opts)

- opts: Object, contains document list templates
- Returns `this`

See `defaultOptions` in [lib/utils/getList.js](lib/utils/getList.js)

## Thanks

- [xcatliu/pagic](https://github.com/xcatliu/pagic)
- [jonschlinkert/html-toc](https://github.com/jonschlinkert/html-toc)
- [Adrian Mejia Blog](http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/)
- ...

## LICENSE

[MIT][license]

[license]: LICENSE
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[coverage]: https://coveralls.io/github/dgeibi/wikic
[coverage-badge]: https://img.shields.io/coveralls/dgeibi/wikic.svg
[build]: https://travis-ci.org/dgeibi/wikic
[build-badge]: https://travis-ci.org/dgeibi/wikic.svg?branch=master
[node]: https://nodejs.org
[node-badge]: https://img.shields.io/badge/node-%3E%3D%207.0.0-brightgreen.svg
[version-badge]: https://img.shields.io/npm/v/wikic.svg
[package]: https://www.npmjs.com/package/wikic
