/* eslint-disable no-underscore-dangle */

module.exports = function findDocs(docsInfos, types) {
  return types.reduce((parent, type) => parent[type], docsInfos);
};
