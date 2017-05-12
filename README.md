# Wikic

[![Build Status][build-badge]][build]
[![Coveralls][coverage-badge]][coverage]
[![MIT License][license-badge]][license]
[![version][version-badge]][package]
[![Node][node-badge]][node]

a simple static site generator

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Example](#example)
- [Usage](#usage)
    - [CLI](#cli)
    - [Node module](#node-module)
- [Getting started](#getting-started)
    - [Installation](#installation)
    - [Configuration and Front Matter](#configuration-and-front-matter)
    - [Layouts](#layouts)
    - [Plugins](#plugins)
    - [Tasks](#tasks)
    - [Suites](#suites)
- [API](#api)
    - [Wikic([cwd, [config]])](#wikiccwd-config)
    - [wikic.setup([cwd, [config]])](#wikicsetupcwd-config)
    - [wikic.clean()](#wikicclean)
    - [wikic.build()](#wikicbuild)
    - [wikic.addPlugin(key, plugin)](#wikicaddpluginkey-plugin)
    - [wikic.addTask(key, task)](#wikicaddtaskkey-task)
    - [wikic.addSuite(suite)](#wikicaddsuitesuite)
    - [wikic.watch()](#wikicwatch)
    - [wikic.serve()](#wikicserve)
    - [wikic.typeMap(key)](#wikictypemapkey)
    - [wikic.getURL(url)](#wikicgeturlurl)
    - [wikic.fse](#wikicfse)
    - [wikic.config](#wikicconfig)
    - [wikic.renderer](#wikicrenderer)
- [Thanks](#thanks)
- [LICENSE](#license)

## Example

- [dgeibi/note](https://github.com/dgeibi/note)

## Usage

### CLI

#### `wikic init`

Use `wikic init` to create a new wikic folder

``` bash
wikic init <dir>
```

#### `wikic build`

Use `wikic build` to build pages.

``` bash
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

``` javascript
const htmlclean = require('htmlclean');
const Wikic = require('wikic');
const docslist = require('wikic-suite-docslist');

const wikic = new Wikic();

// add plugin to minify html before write
wikic.addPlugin('beforeWrite', function minify(context) {
  if (!context.data) return context;
  const html = htmlclean(context.data);
  return Object.assign({}, context, { data: html });
});

// add suite to provide `list` variable
wikic.addSuite(docslist);

// build the site and start watcher and server to debug or preview
wikic
  .build()
  .then(() => wikic.watch())
  .then(() => wikic.serve());
```

## Getting started

### Installation

``` bash
# install as a cli tool
npm install -g wikic

# install as a node dependency
npm install --save wikic
```

### Configuration and Front Matter

Default Config: [lib/defaultConfig.yml][default-config]

You can create `_config.yml`s or a `wikic.config.js` to override defaultConfig.

Here are inheritance chains of configuration:

- [lib/defaultConfig.yml][default-config], `_config.yml` and `wikic.config.js` (in `wikic.cwd`) => `wikic.config`
- `wikic.config`, `_config.yml` (subdirectory of `wikic.cwd`, closest to markdown file) => `context.site`
- `context.page`, `context.site.page`, Front Matter in markdown => `context.page`

The `_config.yml` and `wikic.config.js` in `wikic.cwd` will be loaded as `wikic.config`.

The `_config.yml` closest to markdown will be merged into `context.site` (global config which is passed to plugins).

Front Matter in each markdown will be merged into `context.page` (page config which is passed to plugins) respectively.

**Note**: In `wikic.cwd`, `wikic.config.js` > `_config.yml`

**`wikic.config.js` Example**:

``` javascript
module.exports = {
  title: 'Wikic',
  toc: {
    selectors: 'h2, h3, h4',
  },
};
```

**Front Matter example**:

``` yaml
---
title: Hello World # title of the page
toc: false # disable toc for this page
layout: docs # set layout for this page
---
```

### Layouts

You can create [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates (extname is `.njk`) in `layoutPath`.

In order to specify default layout for markdowns in a specific path, create a `_config.yml` in the path and add lines to it:

``` yaml
page:
  layout: customLayout
```

Also, you can set `layout` in Front Matter for a specific markdown.

#### Variables in Layouts

- `site`, `Object`, reference to `context.site`
- `page`, `Object`, reference to `context.page`
    - `page.types`, `Array`, markdown's dirnames
- `content`, string, content of HTML built from markdown

#### Builtin Filters

- `typeMap`: see [`wikic.typeMap(key)`](#wikictypemapkey)
- `baseurl`: see [`wikic.getURL(url)`](#wikicgeturlurl)
- `relative`: Receives a absolute path string, returns a url relative to current page.
- `typeMaps`: Receives a `Array`, Returns `array.map(typeMap)`. Tips: get typeNames array `{{ page.types | typeMaps }}`

#### Nunjucks in Markdown

Variable `site` and `page` is available.

`{{`, `}}`, `{#`, `#}`, `{%`, `%}` in raw blocks and `<code>` blocks will be escaped.

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

### Plugins

A 'plugin' is a `Function`, which receives a `context` and returns a `context`. If a plugin is invoked, `this` in it may point to `wikic`. The context returned by a plugin will be passed to next plugin.

**context**

The `context` passed to a plugin is an `Object` which contains some of the following properties:

- `src`: string, absolute path of source
- `dist`: string, absolute path of destination
- `data`: string, content of document
- `site`: `Object`, site config
- `page`: `Object`, page config
- `renderContext`: `Object`, nunjucks render context, contains [variables](#variables-in-layouts)
- `IS_DOC`: boolean, whether in `docsPath`

**Types of plugin**

Different types of plugin will invoked in different periods.

- `afterRead`: invoked after reading each markdown file.
- `beforeWrite`: invoked before writing each markdown file.
- `beforeRender`: invoked before rendering each markdown file.

**Example**

In `wikic.config.js`

``` javascript
const htmlclean = require('htmlclean');

module.exports = {
  beforeWritePlugins: [
    (context) => {
      if (!context.data) return context;
        const html = htmlclean(context.data);
        return Object.assign({}, context, { data: html });
    },
  ]
};
```

You can also use [`wikic.addPlugin`](#wikicaddpluginkey-plugin) to add plugins.

### Tasks

Unlike plugins, 'tasks' are `Function` without context.

**Types of task**

Different types of task will invoked in different periods.

- `afterReadAllDocs`: after reading all docs, before writing all docs.
- `beforeBuild`: before building all things.
- `beforeBuildDocs`: before building all docs.
- `afterBuild`: after building all things.
- `afterBuildDocs`: after building all docs.

**Example**

In `wikic.config.js`

``` javascript
module.exports = {
  beforeBuildTasks: [
    function () {
      console.time('build');
    }
  ],
  afterBuildTasks: [
    function () {
      console.timeEnd('build');
    }
  ],
};
```

You can also use [`wikic.addTask`](#wikicaddtaskkey-task) to add tasks.

### Suites

A 'suite' should be a combination of `plugins` and `tasks`. It should be a plain `Object` or a `Function` which receives `config` and returns an `Object` or a falsy value.

**Properties**

There are two kinds of property in suite.

- Tasks:
    - `afterReadAllDocs`
    - `beforeBuild`
    - `beforeBuildDocs`
    - `afterBuild`
    - `afterBuildDocs`
- Plugins:
    - `afterRead`
    - `beforeWrite`
    - `beforeRender`

**Example**

In `wikic.config.js`

``` js
// use an `Object` directly
module.exports = {
  suites: [
    {
      beforeBuild: function () {
        console.time('build');
      },
      afterBuild: function () {
        console.timeEnd('build');
      }
    }
  ],
};

// or use a `Function`
const showBuildTime = function(config) {
  // if option `time` is falsy, do not add suite
  if (!config.time) return null;

  return {
    beforeBuild: function () {
      console.time('build');
    },
    afterBuild: function () {
      console.timeEnd('build');
    }
  };
}

module.exports = {
  suites: [showBuildTime],
};
```

You can also use [`wikic.addSuite`](#wikicaddsuitesuite) to add suites.

## API

### Wikic([cwd, [config]])

- `cwd`: string, working dir, default value is `process.cwd()`
- `config`: `Object`, overwrite config loaded from `cwd`'s `_config.yml` and `wikic.config.js`

Create a `Wikic`. Set working directory to `path/to` and set server's port to `1234`:

``` javascript
const wikic = new Wikic('path/to', { port: 1234 });
```

### wikic.setup([cwd, [config]])

- `cwd`: string, working dir, default value is `process.cwd()`
- `config`: `Object`, overwrite content of `cwd`'s `_config.yml` and `wikic.config.js`
- Returns: `this`

Reloads configurations and layouts.

### wikic.clean()

- Returns a `Promise`

Cleans all the files in `publicPath`

### wikic.build()

- Returns a `Promise`

Builds all the files in `docsPath` and `root`

### wikic.addPlugin(key, plugin)

- `key`: string, type of plugin
- `plugin`: `Function`
- Returns `this`

See also [Plugins](#plugins)

### wikic.addTask(key, task)

- `key`: string, type of task
- `task`: `Function`
- Returns `this`

See also [Tasks](#tasks)

### wikic.addSuite(suite)

- `suite`: `Object` | `Function`
- Returns `this`

See also [Suites](#suites)

### wikic.watch()

- Returns `this`

Watches file change and run `wikic.build()` when changed

### wikic.serve()

- Returns a `Promise`

Serves the files in `PublicPath`

### wikic.typeMap(key)

- `key`: string
- Returns typeName(a string) set in `wikic.config.typeMap`

### wikic.getURL(url)

- `url`: string
- Returns an absolute URL prefixed with base URL

### wikic.fse

A shortcut for [jprichardson/node-fs-extra](https://github.com/jprichardson/node-fs-extra)

### wikic.config

User configuration

See also [Configuration and Front Matter](#configuration-and-front-matter)

### wikic.renderer

Nunjucks renderer

For usage, see [Nunjucks](https://mozilla.github.io/nunjucks/api.html)

## Thanks

- [xcatliu/pagic](https://github.com/xcatliu/pagic)
- [jonschlinkert/html-toc](https://github.com/jonschlinkert/html-toc)
- [Adrian Mejia Blog](http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/)
- ...

## LICENSE

[MIT][license]

[default-config]: https://github.com/wikic/wikic/blob/master/lib/defaultConfig.yml
[license]: https://github.com/wikic/wikic/blob/master/LICENSE
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[coverage]: https://coveralls.io/github/wikic/wikic
[coverage-badge]: https://img.shields.io/coveralls/wikic/wikic.svg
[build]: https://travis-ci.org/wikic/wikic
[build-badge]: https://travis-ci.org/wikic/wikic.svg?branch=master
[node]: https://nodejs.org
[node-badge]: https://img.shields.io/badge/node-%3E%3D%207.0.0-brightgreen.svg
[version-badge]: https://img.shields.io/npm/v/wikic.svg
[package]: https://www.npmjs.com/package/wikic
