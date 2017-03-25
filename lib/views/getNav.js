const typeLink = require('./typeLink')

module.exports = (types, wikic) => {
  const typesInfos = wikic.getTypeLinks(types)
  if (types[0] !== '.') typesInfos.unshift(wikic.getTypeLink(['.']))
  return `<p>${typesInfos.map(typeLink).join(' > ')}</p>`
}
