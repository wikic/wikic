const loadData = require('../loadData')

jest.mock('fs-extra')
jest.mock('../../utils/get-closest-config', () => require('../../../mocks/get-closest-config'))

describe('load Plugins', () => {
  it('should save property into context', async () => {
    const result = await loadData({
      data: '',
      site: {},
      otherKey: true,
      src: '/path/to/',
    })
    expect(result.otherKey).toBeTruthy()
  })

  it('throws if context is not passed as an object', async () => {
    try {
      await loadData()
    } catch (error) {
      expect(error.message).toBe('should pass a object to load.')
    }
  })

  it('throws if context.src is not passed as a string', async () => {
    try {
      await loadData({
        site: {},
      })
    } catch (error) {
      expect(error.message).toBe('context.src must be a string.')
    }
  })

  it('throws if context.site is not passed as a object', async () => {
    try {
      await loadData({
        src: '/path/to',
      })
    } catch (error) {
      expect(error.message).toBe('context.site must be passed as a object.')
    }
  })
})
