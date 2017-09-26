const getConfig = require('../get-config')

jest.mock('../import-js', () => () => ({
  root: '..',
}))

jest.mock('../read-yaml', () => {
  const readYaml = jest.fn()
  readYaml
    .mockReturnValueOnce({
      root: '.',
      title: '',
    })
    .mockReturnValue({
      root: '../wikic',
      title: 'title',
    })
  return readYaml
})

describe('getConfig', () => {
  describe('find userConfig', () => {
    it('works', () => {
      const result = getConfig('/path/to/')
      expect(result).toHaveProperty('root', '..')
      expect(result).toHaveProperty('title', 'title')
    })
  })
})
