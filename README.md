# Wikic

[![Build Status][build-badge]][build]
[![Coveralls][coverage-badge]][coverage]
[![MIT License][license-badge]][license]
[![version][version-badge]][package]
[![Node][node-badge]][node]

a simple static site generator

## Table of Contents

<!-- TOC -->

* [Wikic](#wikic)
  * [Table of Contents](#table-of-contents)
  * [Example](#example)
  * [Usage](#usage)
    * [CLI](#cli)
      * [`wikic init`](#wikic-init)
      * [`wikic build`](#wikic-build)
    * [Node module](#node-module)
  * [Getting started](#getting-started)
    * [Installation](#installation)
    * [Configuration and Front Matter](#configuration-and-front-matter)
    * [Dev Server](#dev-server)
    * [Layouts](#layouts)
      * [Variables in Layouts](#variables-in-layouts)
      * [Builtin Filters](#builtin-filters)
      * [Nunjucks in Markdown](#nunjucks-in-markdown)
    * [Filter](#filter)
    * [Suite](#suite)
    * [Watch handlers](#watch-handlers)
  * [Thanks](#thanks)
  * [API](#api)
  * [LICENSE](#license)

<!-- /TOC -->

## Example

* [dgeibi/note](https://github.com/dgeibi/note)

## Usage

### CLI

#### `wikic init`

Use `wikic init` to create a new wikic folder

```bash
wikic init <dir>
```

#### `wikic build`

Use `wikic build` to build pages.

```bash
wikic build [options]
#  Options:
#
#    -h, --help           output usage information
#    -c, --clean          clean public dir before building
#    -w, --watch          watch src dir change
#    -s, --serve          serve public dir
#    -d, --dir <dir>      change working dir
#    -o, --output <dir>   change public dir
#    -p, --port <number>  change server port
```

### Node module

```javascript
const htmlclean = require('htmlclean')
const Wikic = require('wikic')
const docslist = require('wikic-suite-docslist')

const wikic = new Wikic()

// add filter to minify html before write
wikic.filter.register('beforeWrite', function minify(context) {
  if (!context.data) return context
  context.data = htmlclean(context.data)
  return context
})

// add suite to provide `list` variable
wikic.registerSuite(docslist)

// build the site and start watcher and server to debug or preview
wikic
  .build()
  .then(() => wikic.watch())
  .then(() => wikic.serve())
```

## Getting started

### Installation

```bash
# install as a cli tool
npm install -g wikic

# install as a node dependency
npm install --save wikic
```

### Configuration and Front Matter

There is a default config [lib/defaultConfig.yml][default-config]. We can create `_config.yml`s or a `wikic.config.js` to override it.

There are two kinds of configuration, root config and sub config. A root config must be a `wikic.config.js` or a `_config.yml` in the working directory of a build (aka `wikic.cwd`). A sub config must be a `_config.yml` in the subdirectory of `wikic.cwd`.

Not all options work in sub configs and we can use some of the options such as

* `title`
* `page`
* options that [Filter](#filter)s use, such as `toc`, `markdownIt` and `toc`

There are inheritance chains of configuration:

* root config = `_config.yml`(in the `wikic.cwd`) + `wikic.config.js`(in the `wikic.cwd`)
* sub config = `_config.yml` (closest to markdown file, in the subdirectory of `wikic.cwd`)
* `wikic.config` = [defaultConfig.yml][default-config] + root config
* `context.site` = `wikic.config` + a sub config
* `context.page` = `context.page` + `context.site.page` + Front Matter in markdown

See [Filter](#filter) for details of `context`.

**`wikic.config.js` Example**:

```javascript
module.exports = {
  title: 'Wikic',
  toc: {
    selectors: 'h2, h3, h4',
  },
}
```

**Front Matter example**:

```yaml
---
title: Hello World # title of the page
toc: false # disable toc for this page
layout: docs # set layout for this page
---
```

### Dev Server

We should use a server extension to run `wikic build -s`.

Server extension Example:

* [wikic-live-server](https://www.npmjs.com/package/wikic-live-server)

### Layouts

We can create [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates (extname is `.njk`) in `layoutPath`.

In order to specify default layout for markdowns in a specific path, create a `_config.yml` in the path and add lines to it:

```yaml
page:
  layout: customLayout
```

Also, we can set `layout` in Front Matter for a specific markdown.

#### Variables in Layouts

* `site`, `Object`, reference to `context.site`
* `page`, `Object`, reference to `context.page`
  * `page.types`, `Array`, markdown's dirnames
* `content`, string, content of HTML built from markdown

#### Builtin Filters

* `typeMap`: Get typeName set in `wikic.config.typeMap`
* `baseurl`: Get a URL prefixed with base URL
* `relative`: Receives a absolute path string, returns a url relative to current page.
* `typeMaps`: Receives a `Array`, Returns `array.map(typeMap)`.
  Tips: get typeNames array `{{ page.types | typeMaps }}`

#### Nunjucks in Markdown

Variable `site` and `page` is available.

`{{`, `}}`, `{#`, `#}`, `{%`, `%}` in raw blocks and `<code>` blocks will be escaped.

```html
<!-- markdown -->
{% raw %}
{{ page.title }}
{% endraw %}

<!-- output -->
{{ page.title }}
```

```html
<!-- markdown -->
`{{ page.title }}`

<!-- output -->
<code>{{ page.title }}</code>
```

### Filter

```js
const filter = function(context, wikic) {
  const newContext = Object.assign({}, context)
  // do something with newContext
  return newContext
}
```

A 'filter' is a `Function`, which receives a `context` and the `wikic` and returns a `context`.

The context returned by the filter will be passed to next filter.

**context**

A `context` is corresponding to a build of a markdown file.

`context` of the following types of filter is `null`

* `afterReadAllDocs`: after reading all docs, before writing all docs.
* `beforeBuild`: before building all things.
* `beforeBuildDocs`: before building all docs.
* `afterBuild`: after building all things.
* `afterBuildDocs`: after building all docs.

`context` passed to following types of filter is an `Object`

* `afterRead`: invoked after reading each markdown file.
* `beforeWrite`: invoked before writing each markdown file.
* `beforeRender`: invoked before rendering each markdown file.
* `beforeWriteAsset`: invoked before writing each asset.

The context may contains the following properties:

* `src`: string, absolute path of source
* `dist`: string, absolute path of destination
* `data`: string, content of document; `Buffer`, for assets
* `site`: `Object`, site config
* `page`: `Object`, page config
* `renderContext`: `Object`, nunjucks render context, contains [variables](#variables-in-layouts)
* `IS_DOC`: boolean, whether in `docsPath`

We can use `wikic.filter.register(type, filter)` to register filters.

### Suite

A suite should be a combination of filters.

It should be

* a `string` which is a module id relative to `wikic.cwd`
* a plain `Object`
* or a `Function` which receives `config` and returns an `Object` or a falsy value.

Suite objects' property name should be a [filter](#filter)'s type name.

**Example**

Register suites in `wikic.config.js`

Use `Object`

```js
module.exports = {
  suites: [
    {
      beforeBuild: function() {
        console.time('build')
      },
      afterBuild: function() {
        console.timeEnd('build')
      },
    },
  ],
}
```

Use `Function`

```js
const showBuildTime = function(config) {
  // if option `time` is falsy, do not add suite
  if (!config.time) return null

  return {
    beforeBuild: function() {
      console.time('build')
    },
    afterBuild: function() {
      console.timeEnd('build')
    },
  }
}

module.exports = {
  suites: [showBuildTime],
}
```

Use module ID

```js
module.exports = {
  suites: ['wikic-suite-docslist'],
}
```

We can also use `wikic.registerSuite(suite)` to add suites.

### Watch handlers

**Built-in handlers**

Three built-in handlers:

* `setupAndBuild`: Receives new config and then rebuild
* `build`: Rebuild the whole site
* `buildStaticFile`: When a static file changed which wasn't ignored by `config.excludes` or `config.publicExcludes`, build the static file (copy or generate html) and execute `afterBuild` filter

We can set their values to matchers in [anymatch](https://www.npmjs.com/package/anymatch).

The default value is like following `wikic.config.js`

```js
module.exports = {
  watchHandlers: {
    setupAndBuild: ['**/wikic.config.js', '**/_config.yml'],
    build: [`${config.layoutPath}/**`, `${config.docsPath}/**`],
    buildStaticFile: '**/*',
  },
}
```

**Custom handlers**

We can add handlers for files that won't be handled by built-in handlers like the example:

```js
module.exports = {
  publicExcludes: ['sw-template.js'],

  watchHandlers: {
    custom: {
      sw: {
        matcher: ['sw-template.js'],
        handler: (filePath, wikic) => {
          try {
            genSW(wikic.publicPath)
          } catch (err) {
            console.log('oops, something wrong when generating sw.js')
            return false
            // Return false to find a next matched handler
          }
        },
      },
    },
  },
}
```

**Priority**

The order of finding handler: `setupAndBuild` > `build` > `buildStaticFile` > `custom`

## Thanks

* [hexojs/hexo](https://github.com/hexojs/hexo)
* [xcatliu/pagic](https://github.com/xcatliu/pagic)
* [jonschlinkert/html-toc](https://github.com/jonschlinkert/html-toc)
* [Adrian Mejia Blog](http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/)
* ...

## API

See JSDoc in [lib/wikic/index.js][index.js]

## LICENSE

[MIT][license]

[index.js]: https://github.com/wikic/wikic/blob/master/lib/wikic/index.js
[default-config]: https://github.com/wikic/wikic/blob/master/lib/defaultConfig.yml
[license]: https://github.com/wikic/wikic/blob/master/LICENSE
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[coverage]: https://coveralls.io/github/wikic/wikic?branch=master
[coverage-badge]: https://coveralls.io/repos/github/wikic/wikic/badge.svg?branch=master
[build]: https://travis-ci.org/wikic/wikic
[build-badge]: https://travis-ci.org/wikic/wikic.svg?branch=master
[node]: https://nodejs.org
[node-badge]: https://img.shields.io/badge/node-%3E%3D%208.1.3-brightgreen.svg
[version-badge]: https://img.shields.io/npm/v/wikic.svg
[package]: https://www.npmjs.com/package/wikic
