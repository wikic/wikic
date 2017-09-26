const getConfig = require('../get-config')

jest.mock('../import-js', () => () => null)
jest.mock('../read-yaml', () => {
  const readYaml = jest.fn()
  readYaml
    .mockReturnValueOnce({
      default: 1,
    })
    .mockReturnValue(null)
  return readYaml
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
      expect(result).toEqual({ default: 1 })
    })
  })
})
