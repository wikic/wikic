const addTOC = require('../addTOC')

describe('addTOC Plugins', () => {
  it('should save property into context', () => {
    expect(addTOC({
      data: '',
      config: { page: { toc: true } },
      otherKey: true,
    }).otherKey).toBeTruthy()
  })

  it('should return the same config', () => {
    const obj = { page: {} }
    expect(addTOC({
      data: '',
      config: obj,
    }).config).toBe(obj)
  })

  it('should add toc of page-content', () => {
    const result = addTOC({
      data: '<div id="toc"></div><div class="page-content"><h2>header</h2><div/>',
      config: { page: { toc: true } },
    })
    expect(result.data).toMatch(/li/)
  })

  it('should not add toc not in page-content', () => {
    const result = addTOC({
      data: '<div id="toc"></div><div><h2>header</h2><div/>',
      config: { page: { toc: true } },
    })
    expect(result.data).not.toMatch(/li/)
  })

  it('throws if context not pass', () => {
    expect(() => {
      addTOC()
    }).toThrow()
  })

  it('throws if config not in context', () => {
    expect(() => {
      addTOC({})
    }).toThrow()
  })

  it('throws if page not in context.config', () => {
    expect(() => {
      addTOC({ config: {} })
    }).toThrow()
  })
})
