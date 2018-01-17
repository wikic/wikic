const getRenderer = require('../get-renderer')

jest.mock('nunjucks', () => require('../../../mocks/nunjucks'))

describe('wikic.renderer(nunjucks)', () => {
  it('baseurl, typeMap, typeMaps Filter', () => {
    const getURL = jest.fn(() => 'url')
    const typeMap = jest.fn()
    const wikic = {
      getURL,
      typeMap,
      layoutPath: '',
    }
    const renderer = getRenderer(wikic)

    expect(renderer.addFilter).toHaveBeenCalledTimes(3)
    expect(renderer.addFilter.mock.calls[0][0]).toBe('baseurl')
    expect(renderer.addFilter.mock.calls[1][0]).toBe('typeMap')
    expect(renderer.addFilter.mock.calls[2][0]).toBe('typeMaps')
  })
})
