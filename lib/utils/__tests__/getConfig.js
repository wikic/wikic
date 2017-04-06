const getConfig = require('../getConfig')

jest.mock('fs-promise', () => {
  const fsp = {}
  fsp.existsSync = jest.fn()
  fsp.existsSync.mockReturnValueOnce(false).mockReturnValue(true)
  fsp.readJsonSync = () => ({
    root: '..',
    title: '123',
  })
  return fsp
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
    expect(result).toHaveProperty('baseurl', '')
    expect(result).toHaveProperty('port', 4000)
    expect(result).toHaveProperty('layoutPath', '_layouts')
    expect(result).toHaveProperty('publicPath', 'docs')
    expect(result).toHaveProperty('excludes', [])
    expect(result).toHaveProperty('typeMap', {})
    expect(result).toHaveProperty('page')
  })

  it('returns userConfig at the top of default', () => {
    const result = getConfig('/path/to/')
    expect(result).toHaveProperty('root', '..')
    expect(result).toHaveProperty('title', '123')
    expect(result).toHaveProperty('baseurl', '')
  })
})
