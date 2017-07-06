const importJS = require('../import-js');

describe('Import JS', () => {
  it('throws if pathname not passed', () => {
    expect(() => {
      importJS();
    }).toThrow();
  });

  it('returns null if not file not found', () => {
    expect(importJS('example/foo.js')).toBe(null);
  });
});
