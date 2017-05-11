const collectInfo = require('../collectInfo');

describe('collectInfo plugin', () => {
  it('should save property into context', () => {
    const wikicMock = {
      infoTree: {},
    };
    const result = collectInfo.call(wikicMock, {
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
      infoTree: {},
    };
    collectInfo.call(wikicMock, {
      IS_DOC: true,
      page: {
        title: 'the title',
        hide: true,
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
    });
    expect(wikicMock.infoTree).toEqual({});
  });

  it("should throw if can'n find context.page", () => {
    const wikicMock = {
      infoTree: {},
    };
    expect(() => {
      collectInfo.call(wikicMock, {
        IS_DOC: true,
      });
    }).toThrow();
  });

  it('should fill info into infoTree', () => {
    const wikicMock = {
      infoTree: {},
    };
    collectInfo.call(wikicMock, {
      IS_DOC: true,
      page: {
        title: 'the title',
        address: '/1.html',
        types: ['a', 'b', 'c'],
      },
    });
    collectInfo.call(wikicMock, {
      IS_DOC: true,
      page: {
        title: 'another',
        address: '/2.html',
        types: ['a', 'b', 'd'],
      },
    });
    expect(wikicMock.infoTree).toEqual({
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
      infoTree: {},
    };
    expect(
      collectInfo.call(wikicMock, {
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
    collectInfo.call(wikicMock, {
      page: {
        title: 'another',
        address: '/2.html',
        types: ['a', 'b', 'd'],
      },
    });
    expect(wikicMock.infoTree).toEqual({});
  });
});
