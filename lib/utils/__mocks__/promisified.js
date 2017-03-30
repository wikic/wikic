const promisified = jest.genMockFromModule('../promisified')

const globResult = {}

promisified.findParentDir = function findParentDir() {
  return new Promise((resolve) => {
    process.nextTick(
      () => resolve('/path/to/')
    )
  })
}
promisified.glob = function glob(key) {
  return new Promise((resolve) => {
    process.nextTick(
      () => resolve(globResult[key])
    )
  })
}

// eslint-disable-next-line no-underscore-dangle
promisified.__setGlob__ = (key, array) => { globResult[key] = array }

module.exports = promisified
