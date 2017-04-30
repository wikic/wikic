/* eslint-disable no-param-reassign, no-underscore-dangle */
const _ = require('lodash');

module.exports = function fillInfo(context) {
  if (!context.IS_DOC) return context;

  const { page } = context;
  if (!_.isPlainObject(page)) {
    throw Error('expect context to be a Object');
  }
  const { types, address, title, hide } = page;

  if (hide) return context;

  const docInfo = {
    address,
    title,
  };

  types.reduce(
    (parent, type, index, arr) => {
      if (!_.isPlainObject(parent[type])) {
        parent[type] = { _docs: [] };
      }
      if (index === arr.length - 1) {
        parent[type]._docs.push(docInfo);
      }
      return parent[type];
    },
    this.docsInfos
  );

  return context;
};
