const globResult = {}

function glob(key) {
  return new Promise((resolve) => {
    process.nextTick(() => resolve(globResult[key]))
  })
}

glob.__setPath = (key, array) => {
  globResult[key] = array
}

module.exports = glob
