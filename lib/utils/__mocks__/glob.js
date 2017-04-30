const globResult = {};

function glob(key) {
  return new Promise((resolve) => {
    process.nextTick(() => resolve(globResult[key]));
  });
}

// eslint-disable-next-line no-underscore-dangle
glob.__setPath = (key, array) => {
  globResult[key] = array;
};

module.exports = glob;
