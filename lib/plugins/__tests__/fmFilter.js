const fmFilter = require('../fmFilter')

describe('fmFilter Plugins', () => {
  it('should keep other properties on context', () => {
    expect(
      fmFilter({
        data: '',
        config: {},
        otherKey: true,
      }).otherKey
    ).toBeTruthy()
  })

  it('should not return the same config', () => {
    const obj = {}
    expect(
      fmFilter({
        data: '',
        config: obj,
      }).config
    ).not.toBe(obj)
  })

  it('preserves other content into data, information in front matter save in config.page', () => {
    const result = fmFilter({
      data: `---
title: hi
author: xiaomin
---

## HI, I'm Xiaomin
`,
      config: {},
    })

    expect(result.data).toBe(
      `
## HI, I'm Xiaomin
`
    )
    expect(result.config.page).toMatchObject({ title: 'hi', author: 'xiaomin' })
  })

  it('always assigns data and config.page', () => {
    const result = fmFilter({
      data: `
## HI, I'm Xiaomin
`,
      config: {},
    })

    expect(result.data).toBe(
      `
## HI, I'm Xiaomin
`
    )
  })

  it('throws if context not pass', () => {
    expect(() => {
      fmFilter()
    }).toThrow()
  })

  it('throws if data not in context', () => {
    expect(() => {
      fmFilter({
        config: {},
      })
    }).toThrow()
  })

  it('throws if config not in context', () => {
    expect(() => {
      fmFilter({
        data: '',
      })
    }).toThrow()
  })
})
