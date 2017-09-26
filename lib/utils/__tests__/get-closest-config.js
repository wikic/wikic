const getClosestConfig = require('../get-closest-config')

jest.mock('../../utils/find-parent-dir', () => {
  const fn = jest.fn()
  fn.mockReturnValueOnce(null).mockReturnValue('/path')
  return fn
})

jest.mock('../read-yaml', () => {
  const readYaml = jest.fn(() => ({
    field: 'a',
  }))
  return readYaml
})

describe('getClosestConfig', () => {
  describe('find cache', () => {
    it('returns cache', async () => {
      const originalConfig = {}
      const caches = {
        dir2dir: {
          '/path/to': '/path',
        },
        dir2conf: {
          '/path': { a: 0 },
        },
      }
      const result = await getClosestConfig('/path/to', originalConfig, caches)
      expect(result).toEqual({ a: 0 })
    })
  })

  describe('cache not found', () => {
    describe('_config.yml not found', () => {
      it('returns new config', async () => {
        const originalConfig = {}
        const caches = { dir2dir: {}, dir2conf: {} }

        const result = await getClosestConfig('/path/to', originalConfig, caches)
        expect(result).not.toBe(originalConfig)
        expect(result).toEqual(originalConfig)
      })
    })
    describe('find _config.yml', () => {
      it('returns config and caches config', async () => {
        const originalConfig = {}
        const caches = { dir2dir: {}, dir2conf: {} }

        const result = await getClosestConfig('/path/to', originalConfig, caches)

        const expected = { field: 'a' }
        expect(result).toEqual(expected)
        expect(caches).toEqual({
          dir2dir: {
            '/path/to': '/path',
          },
          dir2conf: {
            '/path': expected,
          },
        })
      })
    })
  })
})
