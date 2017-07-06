const nunjucks = require('nunjucks');

module.exports = (wikic) => {
  // eslint-disable-next-line no-param-reassign
  const renderer = nunjucks.configure(wikic.layoutPath, {
    trimBlocks: true,
    autoescape: true,
    watch: false,
  });
  renderer.addFilter('baseurl', wikic.getURL.bind(wikic));
  renderer.addFilter('typeMap', wikic.typeMap.bind(wikic));
  renderer.addFilter('typeMaps', arr => arr.map(key => wikic.typeMap(key)));
  return renderer;
};
