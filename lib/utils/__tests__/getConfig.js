const getConfig = require('../getConfig')

jest.mock('fs-promise', () => {
  const mockExistsSync = jest.fn()
  mockExistsSync.mockReturnValueOnce(false).mockReturnValue(true)
  return {
    existsSync: mockExistsSync,
    readJsonSync() {
      return {
        root: '..',
        title: '123',
      }
    },
  }
})

describe('getConfig', () => {
  it('throws if path is not absolute', () => {
    expect(() => {
      getConfig('path/to')
    }).toThrow('path should be absolude.')
  })

  it('return defaultConfig if cannot find userConfig', () => {
    const result = getConfig('/path/to/')
    expect(result).toHaveProperty('root', '.')
    expect(result).toHaveProperty('docsPath', '_note')
    expect(result).toHaveProperty('title', '')
    expect(result).toHaveProperty('layout', 'default')
    expect(result).toHaveProperty('overwriteIndex', false)
    expect(result).toHaveProperty('indexLayout', '')
    expect(result).toHaveProperty('baseurl', '')
    expect(result).toHaveProperty('port', 4000)
    expect(result).toHaveProperty('layoutPath', '_layouts')
    expect(result).toHaveProperty('publicPath', 'docs')
    expect(result).toHaveProperty('excludes', [])
    expect(result).toHaveProperty('typeMap', {})
  })

  it('returns userConfig at the top of default', () => {
    const result = getConfig('/path/to/')
    expect(result).toHaveProperty('root', '..')
    expect(result).toHaveProperty('title', '123')
    expect(result).toHaveProperty('baseurl', '')
  })
})
