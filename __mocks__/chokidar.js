const chokidar = jest.genMockFromModule('chokidar')
const watch = jest.fn(() => ({
  on: jest.fn(() => watch()),
}))
chokidar.watch = watch

module.exports = chokidar
