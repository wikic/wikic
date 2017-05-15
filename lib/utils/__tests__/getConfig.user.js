const getConfig = require('../getConfig');

jest.mock('../loadJS', () => () => ({
  root: '..',
}));

jest.mock('../readYaml', () => {
  const readYaml = jest.fn();
  readYaml
    .mockReturnValueOnce({
      root: '.',
      title: '',
    })
    .mockReturnValue({
      root: '../wikic',
      title: 'title',
    });
  return readYaml;
});

describe('getConfig', () => {
  describe('find userConfig', () => {
    it('works', () => {
      const result = getConfig('/path/to/');
      expect(result).toHaveProperty('root', '..');
      expect(result).toHaveProperty('title', 'title');
    });
  });
});
