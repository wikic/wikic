const getWatchIgnored = require('../get-watch-ignored.js')

describe('get-watch-ignored', () => {
  it('layout-path/docs-path with _', () => {
    const config = {
      publicPath: 'docs',
      layoutPath: '_layout',
      docsPath: '_note',
      excludes: [],
    }
    const ignored = getWatchIgnored(config)
    expect(ignored).toEqual([/(^|[/\\])\../, 'docs/**', '**/node_modules/**', '_!(layout|note)/**'])
  })

  it('layout-path with _', () => {
    const config = {
      publicPath: 'docs',
      layoutPath: '_layout',
      docsPath: 'note',
      excludes: [],
    }
    const ignored = getWatchIgnored(config)
    expect(ignored).toEqual([/(^|[/\\])\../, 'docs/**', '**/node_modules/**', '_!(layout)/**'])
  })

  it('without _', () => {
    const config = {
      publicPath: 'docs',
      layoutPath: 'layout',
      docsPath: 'note',
      excludes: [],
    }
    const ignored = getWatchIgnored(config)
    expect(ignored).toEqual([/(^|[/\\])\../, 'docs/**', '**/node_modules/**', '_*/**'])
  })
})
