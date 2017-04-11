const fm = require('front-matter')
const _ = require('lodash')

module.exports = (context) => {
  if (!_.isPlainObject(context)) throw Error('expect context to be a Object')
  if (typeof context.data !== 'string') throw Error('expect context.data to be a string')
  if (!_.isPlainObject(context.site)) throw Error('expect context.site to be a Object')
  const { data, site } = context
  const frontMatter = fm(data)
  const page = _.merge({}, context.page, site.page, frontMatter.attributes)

  return Object.assign(context, {
    data: frontMatter.body,
    page,
  })
}
