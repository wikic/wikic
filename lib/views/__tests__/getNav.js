const getNav = require('../getNav')

describe('getNav', () => {
  const wikic = {
    getTypeLinks() {
      return [
        { value: 'a', url: '/1.html' },
        { value: 'b', url: '/2.html' },
        { value: 'c', url: '/3.html' },
        { value: 'd', url: '/4.html' },
      ]
    },

    getTypeLink() {
      return { value: 'Home', url: '/' }
    },
  }
  it('works', () => {
    expect(getNav(['a', 'b', 'c', 'd'], wikic)).toBe('<p><a href="/">Home</a> > <a href="/1.html">a</a> > <a href="/2.html">b</a> > <a href="/3.html">c</a> > <a href="/4.html">d</a></p>')
    expect(getNav(['.'], wikic)).toBe('<p><a href="/1.html">a</a> > <a href="/2.html">b</a> > <a href="/3.html">c</a> > <a href="/4.html">d</a></p>')
  })
})
