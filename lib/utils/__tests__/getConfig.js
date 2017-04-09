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
  fs.existsSync = jest.fn(() => false)
  fs.readFileSync = jest.fn()
  fs.readFileSync.mockReturnValueOnce(defaultConfig).mockReturnValue(userConfig)
  return fs
})

describe('getConfig', () => {
  it('throws if path is not absolute', () => {
    expect(() => {
      getConfig('path/to')
    }).toThrow('path should be absolude.')
  })

  describe('cannot find userConfig', () => {
    it('return defaultConfig', () => {
      const result = getConfig('/path/to/')
      expect(result).toHaveProperty('root', '.')
      expect(result).toHaveProperty('docsPath', '_notes')
      expect(result).toHaveProperty('title', '')
      expect(result).toHaveProperty('baseurl', '')
      expect(result).toHaveProperty('port', 4000)
      expect(result).toHaveProperty('layoutPath', '_layouts')
      expect(result).toHaveProperty('publicPath', 'docs')
      expect(result).toHaveProperty('excludes', [])
      expect(result).toHaveProperty('typeMap', {})
      expect(result).toHaveProperty('page')
    })
  })
})
