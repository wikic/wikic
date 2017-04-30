const fillInfo = require('../fillInfo');

describe('fillInfo plugin', () => {
  it('should save property into context', () => {
    const wikicMock = {
      docsInfos: {},
    };
    const result = fillInfo.call(wikicMock, {
      IS_DOC: true,
      page: {
        title: 'the title',
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
      otherKey: true,
    });
    expect(result.otherKey).toBeTruthy();
  });

  it('should not add info if page.hide is true', () => {
    const wikicMock = {
      docsInfos: {},
    };
    fillInfo.call(wikicMock, {
      IS_DOC: true,
      page: {
        title: 'the title',
        hide: true,
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
    });
    expect(wikicMock.docsInfos).toEqual({});
  });

  it("should throw if can'n find context.page", () => {
    const wikicMock = {
      docsInfos: {},
    };
    expect(() => {
      fillInfo.call(wikicMock, {
        IS_DOC: true,
      });
    }).toThrow();
  });

  it('should fill info into docsInfos', () => {
    const wikicMock = {
      docsInfos: {},
    };
    fillInfo.call(wikicMock, {
      IS_DOC: true,
      page: {
        title: 'the title',
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
    });
    fillInfo.call(wikicMock, {
      IS_DOC: true,
      page: {
        title: 'another',
        address: '/2.html',
        types: ['a', 'b', 'd'],
      },
    });
    expect(wikicMock.docsInfos).toEqual({
      a: {
        _docs: [],
        b: {
          _docs: [],
          c: { _docs: [{ address: '/1.html', title: 'the title' }] },
          d: { _docs: [{ address: '/2.html', title: 'another' }] },
        },
      },
    });
  });

  it('should do nothing if IS_DOC not true', () => {
    const wikicMock = {
      docsInfos: {},
    };
    expect(
      fillInfo.call(wikicMock, {
        page: {
          title: 'the title',
          address: '/1.html',
          types: ['a', 'b', 'c'],
        },
      })
    ).toEqual({
      page: {
        title: 'the title',
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
    });
    fillInfo.call(wikicMock, {
      page: {
        title: 'another',
        address: '/2.html',
        types: ['a', 'b', 'd'],
      },
    });
    expect(wikicMock.docsInfos).toEqual({});
  });
});
