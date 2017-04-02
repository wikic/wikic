const fillInfo = require('../fillInfo')

describe('fillInfo plugin', () => {
  it('should save property into context', () => {
    const wikicMock = {
      docsInfos: {},
    }
    const result = fillInfo.call(wikicMock, {
      config: {
        page: {
          title: 'the title',
        },
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
      otherKey: true,
    })
    expect(result.otherKey).toBeTruthy()
  })

  it('should not add info if page.hide is true', () => {
    const wikicMock = {
      docsInfos: {},
    }
    fillInfo.call(wikicMock, {
      config: {
        page: {
          title: 'the title',
          hide: true,
        },
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
    })
    expect(wikicMock.docsInfos).toEqual({})
  })

  it('should throw if can\'n find context.config.page', () => {
    const wikicMock = {
      docsInfos: {},
    }
    const func = fillInfo.bind(wikicMock, {
      config: {
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
    })
    expect(func).toThrow(/front matter/)
  })

  it('should fill info into docsInfos', () => {
    const wikicMock = {
      docsInfos: {},
    }
    fillInfo.call(wikicMock, {
      config: {
        page: {
          title: 'the title',
        },
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
    })
    fillInfo.call(wikicMock, {
      config: {
        page: {
          title: 'another',
        },
        address: '/2.html',
        types: ['a', 'b', 'd'],
      },
    })
    expect(wikicMock.docsInfos).toEqual(
      {
        a: {
          _docs: [],
          b: {
            _docs: [],
            c: { _docs: [{ address: '/1.html', title: 'the title' }] },
            d: { _docs: [{ address: '/2.html', title: 'another' }] },
          },
        },
      })
  })
})
