const importJS = require('../import-js')
const { resolve } = require('path')

describe('Import JS', () => {
  it('throws if pathname not passed', () => {
    expect(() => {
      importJS()
    }).toThrow()
  })

  it('returns null if not file not found', () => {
    expect(importJS('example/foo.js')).toBe(null)
  })

  it('imports something', () => {
    const path = resolve('example/wikic.config.js')
    expect(importJS(path)).not.toBe(null)
  })
})
