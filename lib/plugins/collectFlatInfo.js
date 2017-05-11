/* eslint-disable no-param-reassign, no-underscore-dangle */

module.exports = function collectFlatInfo(context) {
  if (!context.IS_DOC) return context;

  const { page } = context;
  if (!page) {
    throw Error('expect context to be a Object');
  }
  const { types, address, title, hide } = page;
  if (hide) return context;
  const typesMapped = types.map(this.typeMap);

  const info = {
    address,
    title,
    types: typesMapped,
  };

  if (!this.flatInfos) this.flatInfos = [];
  this.flatInfos.push(info);

  return context;
};
