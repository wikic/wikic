const Builder = require('../get-builder')

describe('get-builder', () => {
  it('works', () => {
    const wikic = {}
    const builder = Builder(wikic)
    expect(builder).toHaveProperty('buildMD')
    expect(builder).toHaveProperty('readMD')
    expect(builder).toHaveProperty('writeMD')
    expect(builder).toHaveProperty('renderMD')
    expect(builder).toHaveProperty('readDoc')
  })
})
