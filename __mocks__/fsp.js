const fsp = jest.genMockFromModule('fs-promise')

fsp.readFile = () => Promise.resolve('')
fsp.readJson = () => Promise.resolve({})
fsp.emptyDirSync = () => undefined
fsp.outputFile = () => Promise.resolve()
fsp.removeSync = () => undefined
fsp.copy = () => Promise.resolve()

module.exports = fsp
