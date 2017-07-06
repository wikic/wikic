const readYaml = require('../read-yaml');

jest.mock('fs', () => {
  const defaultConfig = `root: .
page:
`;
  const fs = {};
  fs.existsSync = () => true;
  fs.readFileSync = jest.fn(() => defaultConfig);
  return fs;
});

describe('readYaml', () => {
  it('ignore null key', () => {
    expect(readYaml('s.yml')).toEqual({
      root: '.',
    });
  });
});
