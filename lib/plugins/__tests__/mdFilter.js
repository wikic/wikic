const mdFilter = require('../mdFilter')

describe('mdFilter', () => {
  it('should save property into context', () => {
    expect(mdFilter({
      data: '',
      config: {},
      otherKey: true,
    }).otherKey).toBeTruthy()
  })

  it('should not touch config', () => {
    const config = {}
    const result = mdFilter({
      data: '',
      config,
    })
    expect(result.config).toBe(config)
    expect(result.config).toEqual(config)
  })

  it('should render markdown', () => {
    const result = mdFilter({
      data: '# Markdown',
    })
    expect(result.data).toMatch(/<h1>/)
  })

  it('should render codeblock', () => {
    const result = mdFilter({
      data: '``` javascript\nif(true) console.log("yes")\n```',
    })
    expect(result.data).toMatch(/hljs-literal/)
  })

  it('do not exist if not find lang', () => {
    let result
    expect(() => {
      result = mdFilter({
        data: '``` _a__kindoflang\no_0 ha?\n```',
      })
    }).not.toThrow()
    expect(result.data).toMatch('<code>o_0 ha?')
  })
})
