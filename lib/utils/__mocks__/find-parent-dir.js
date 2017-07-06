module.exports = function findParentDir() {
  return new Promise((resolve) => {
    process.nextTick(() => resolve('/path/to/'));
  });
};
