const renderer = require('../renderer')

describe('render', () => {
  it('throws if not configure', () => {
    expect(() => {
      renderer.render()
    }).toThrow()
  })

  it('works', () => {
    expect(() => {
      renderer.configure('.')
      renderer.render('README.md')
    }).not.toThrow()
  })
})
