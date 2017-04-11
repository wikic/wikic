const load = require('../load')

jest.mock('fs-promise')
jest.mock('../../utils/getClosestConfig', () => (src, site) => Object.assign({}, site))

describe('load Plugins', () => {
  it('should save property into context', async () => {
    const result = await load({
      data: '',
      site: {},
      otherKey: true,
      src: '/path/to/',
    })
    expect(result.otherKey).toBeTruthy()
  })

  it('throws if context is not passed as an object', async () => {
    try {
      await load()
    } catch (error) {
      expect(error.message).toBe('should pass a object to load.')
    }
  })

  it('throws if context.src is not passed as a string', async () => {
    try {
      await load({
        site: {},
      })
    } catch (error) {
      expect(error.message).toBe('context.src must be a string.')
    }
  })

  it('throws if context.site is not passed as a object', async () => {
    try {
      await load({
        src: '/path/to',
      })
    } catch (error) {
      expect(error.message).toBe('context.site must be passed as a object.')
    }
  })
})
