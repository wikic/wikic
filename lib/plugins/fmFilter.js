const fm = require('front-matter')

module.exports = ({ data, config }) => {
  const { attributes, body } = fm(data)
  const newConfig = Object.assign({}, config, attributes)
  return { data: body, config: newConfig }
}
