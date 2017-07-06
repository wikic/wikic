const logger = require('../utils/log');
const load = require('../filters/load');
const fse = require('fs-extra');
const path = require('path');

module.exports = (wikic) => {
  const builder = {};

  builder.buildMD = oContext =>
    builder.readMD(oContext).then(builder.renderMD).then(builder.writeMD).catch(logger.error);

  builder.readMD = async (oContext) => {
    const context = await load(oContext);
    const { dist, page: oPage } = context;

    const page = oPage || {};
    page.address = wikic.getURL(path.relative(wikic.publicPath, dist).split(path.sep).join('/'));
    context.page = page;
    await wikic.filter.exec('afterRead', context, wikic);
    return context;
  };

  builder.writeMD = async (context) => {
    await wikic.filter.exec('beforeWrite', context, wikic);
    const { dist, data } = context;
    await fse.outputFile(dist, data);
    return context;
  };

  builder.renderMD = async (context) => {
    await wikic.filter.exec('beforeRender', context, wikic);
    const { data: oData, page, renderContext } = context;
    const { address, layout } = page;
    renderContext.content = oData;

    const from = path.dirname(address);
    wikic.renderer.addFilter('relative', to => path.posix.relative(from, to));
    const data = wikic.renderer.render(`${layout}.njk`, renderContext);

    return Object.assign(context, { data });
  };

  builder.readDoc = (filePath) => {
    const src = path.join(wikic.docsPath, filePath);
    const types = path.dirname(filePath).split(path.posix.sep);
    const targetRelative = filePath.replace(/\.md$/, '.html');
    const dist = path.join(wikic.publicPath, targetRelative);
    const site = Object.assign({}, wikic.config);
    const page = { types };

    return builder.readMD({
      src,
      dist,
      site,
      page,
      IS_DOC: true,
      configCaches: wikic.configCaches,
    });
  };

  return builder;
};
