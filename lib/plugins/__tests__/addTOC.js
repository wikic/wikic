const addTOC = require('../addTOC')

describe('addTOC Plugins', () => {
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

  describe('selectors works', () => {
    it('does not select what is not matched', () => {
      const result = addTOC({
        data: `<div id="toc"></div>
              <div> <h2>header</h2> <div/>`,
        config: {
          toc: {
            selectors: '.page-content h2',
            page: { toc: true },
          },
          page: {
            toc: true,
          },
        },
      })
      expect(result.data).not.toMatch(/li/)
    })

    it('selects what is matched', () => {
      const result = addTOC({
        data: `<div id="toc"></div>
              <div class="page-content"> <h2>header</h2> <div/>`,
        config: {
          toc: {
            selectors: '.page-content h2',
          },
          page: {
            toc: true,
          },
        },
      })
      expect(result.data).toMatch(/li/)
    })
  })

  describe('minLength', () => {
    it('does not generate toc if matched item < minLength', () => {
      const result = addTOC({
        data: `<div id="toc"></div>
              <div class="page-content"> <h2>header</h2> <div/>`,
        config: {
          toc: {
            selectors: '.page-content h2',
            minLength: 2,
          },
          page: {
            toc: true,
          },
        },
      })
      expect(result.data).not.toMatch(/li/)
    })

    it('does generate toc if matched item = minLength', () => {
      const result = addTOC({
        data: `<div id="toc"></div>
              <div class="page-content"> <h2>header1</h2> <h2>header2</h2> <div/>`,
        config: {
          toc: {
            selectors: '.page-content h2',
            minLength: 2,
          },
          page: {
            toc: true,
          },
        },
      })
      expect(result.data).toMatch(/li/)
    })
  })

  it('appends header', () => {
    const result = addTOC({
      data: `<div id="toc"></div>
              <div class="page-content"> <h2>header1</h2> <h2>header2</h2> <div/>`,
      config: {
        toc: {
          selectors: '.page-content h2',
          header: 'this is toc header',
        },
        page: {
          toc: true,
        },
      },
    })
    expect(result.data).toMatch('this is toc header')
  })
})
