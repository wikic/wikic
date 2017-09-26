const toc = require('html-toc')
const _ = require('lodash')
const GithubSlugger = require('github-slugger')

const githubSlugger = new GithubSlugger()
const slugger = text => githubSlugger.slug(text)
const anchorTemplate = id => `<a class="anchor" href="#${id}"></a>`

module.exports = (context) => {
  if (!_.isPlainObject(context)) throw Error('expect context to be a Object')
  if (!_.isString(context.data)) {
    throw Error('expect context.data to be a String')
  }
  if (!_.isPlainObject(context.site)) {
    throw Error('expect context.site to be a Object')
  }
  if (!_.isPlainObject(context.page)) {
    throw Error('expect context.page to be a Object')
  }
  if (!context.page.toc) return context

  githubSlugger.reset()

  const opts = Object.assign(
    {},
    {
      selectors: 'h1, h2',
      minLength: 0,
      header: '',
      id: '#toc',
      addID: true,
      parentLink: false,
      slugger,
      anchorTemplate,
    },
    context.site.toc
  )

  const data = toc(context.data, opts)
  return Object.assign(context, { data })
}
