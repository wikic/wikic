/* eslint-disable no-param-reassign, no-underscore-dangle */

module.exports = function collectInfo(context) {
  if (!context.IS_DOC) return context;

  const { page } = context;
  if (!page) {
    throw Error('expect context to be a Object');
  }
  const { types, address, title, hide } = page;

  if (hide) return context;

  const info = {
    address,
    title,
  };

  if (!this.infoTree) this.infoTree = {};
  types.reduce(
    (parent, type, index, arr) => {
      if (!parent[type]) {
        parent[type] = { _docs: [] };
      }
      if (index === arr.length - 1) {
        parent[type]._docs.push(info);
      }
      return parent[type];
    },
    this.infoTree
  );

  return context;
};
