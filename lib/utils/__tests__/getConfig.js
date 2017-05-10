const getConfig = require('../getConfig');

jest.mock('../loadJS', () => () => null);
jest.mock('../readYaml', () => {
  const readYaml = jest.fn();
  readYaml
    .mockReturnValueOnce({
      default: 1,
    })
    .mockReturnValue(null);
  return readYaml;
});

describe('getConfig', () => {
  it('throws if path is not absolute', () => {
    expect(() => {
      getConfig('path/to');
    }).toThrow('path should be absolude.');
  });

  describe('cannot find userConfig', () => {
    it('return defaultConfig', () => {
      const result = getConfig('/path/to/');
      expect(result).toEqual({ default: 1 });
    });
  });
});
