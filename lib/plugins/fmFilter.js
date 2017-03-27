const fm = require('front-matter')

module.exports = (context) => {
  const { data, config } = context
  const { attributes, body } = fm(data)
  const newConfig = Object.assign({}, config, { attributes })
  return Object.assign(context, { data: body, config: newConfig })
}
