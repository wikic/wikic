const readYaml = require('../read-yaml');

jest.mock('fs', () => {
  const defaultConfig = `root: .
page:
`;
  const fs = {};
  const existsSync = jest.fn();
  existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
  fs.existsSync = existsSync;
  fs.readFileSync = jest.fn(() => defaultConfig);
  return fs;
});

test('ignores null key', () => {
  expect(readYaml('s.yml')).toEqual({
    root: '.',
  });
});

test('returns null if file not found', () => {
  expect(readYaml('x.yml')).toBe(null);
});
