const getConfig = require('../getConfig')

jest.mock('fs', () => {
  const defaultConfig = `root: .
docsPath: _notes
title: ''
baseurl: ''
port: 4000
layoutPath: _layouts
publicPath: docs
excludes: []
typeMap: {}
page:
  layout: default
  toc: true
`

  const userConfig = `root: ..
title: thetitle
`
  const fs = {}
  fs.existsSync = jest.fn(() => true)
  fs.readFileSync = jest.fn()
  fs.readFileSync.mockReturnValueOnce(defaultConfig).mockReturnValue(userConfig)
  return fs
})

describe('find userConfig', () => {
  it('works', () => {
    const result = getConfig('/path/to/')
    expect(result).toHaveProperty('root', '..')
    expect(result).toHaveProperty('title', 'thetitle')
    expect(result).toHaveProperty('baseurl', '')
  })
})
