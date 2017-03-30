const getList = require('../getList')

describe('getList', () => {
  const docsInfos = { a: {
    _docs: [
      { address: '/1.html', title: 'the title1' },
      { address: '/2.html', title: 'the title2' },
    ],
    b: {
      _docs: [
      { address: '/3.html', title: 'the title3' },
      { address: '/4.html', title: 'the title4' },
      ],
      c: { _docs: [{ address: '/5.html', title: 'the title5' }] },
    },
  } }
  const wikic = {
    getURL(url) { return `/base${url}` },
    getTypeLink(types) { return { value: types[types.length - 1], url: types.join('/') } },
  }
  it('works', () => {
    expect(getList(['a', 'b', 'c'], docsInfos, wikic)).toMatch('<a href="/base/3.html">the title3</a>')
  })
})
