const load = require('../load')

jest.mock('fs-promise')
jest.mock('../../utils/getClosestConfig', () =>
  (from, config) => Object.assign({}, config))

describe('load Plugins', () => {
  it('should save property into context', async () => {
    const result = await load({
      data: '',
      config: {},
      otherKey: true,
      from: '/path/to/',
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

  it('throws if context.from is not passed as a string', async () => {
    try {
      await load({
        config: {},
      })
    } catch (error) {
      expect(error.message).toBe('context.from must be a string.')
    }
  })

  it('throws if context.config is not passed as a object', async () => {
    try {
      await load({
        from: '/path/to',
      })
    } catch (error) {
      expect(error.message).toBe('context.config must be passed as a object.')
    }
  })
})
