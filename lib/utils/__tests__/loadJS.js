const loadJS = require('../loadJS');

describe('loadJS', () => {
  it('throws if pathname not passed', () => {
    expect(() => {
      loadJS();
    }).toThrow();
  });

  it('returns null if not file not found', () => {
    expect(loadJS('example/foo.js')).toBe(null);
  });
});
