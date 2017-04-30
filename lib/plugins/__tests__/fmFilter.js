const fmFilter = require('../fmFilter');

describe('fmFilter Plugins', () => {
  it('should keep other properties on context', () => {
    expect(
      fmFilter({
        data: '',
        site: {},
        otherKey: true,
      }).otherKey
    ).toBeTruthy();
  });

  it('should return the same site', () => {
    const obj = {};
    expect(
      fmFilter({
        data: '',
        site: obj,
      }).site
    ).toBe(obj);
  });

  it('saves other content in data, saves front matter in page', () => {
    const result = fmFilter({
      data: `---
title: hi
author: xiaomin
---

## HI, I'm Xiaomin
`,
      site: {},
    });

    expect(result.data).toBe(
      `
## HI, I'm Xiaomin
`
    );
    expect(result.page).toMatchObject({ title: 'hi', author: 'xiaomin' });
  });

  it('always saves data', () => {
    const result = fmFilter({
      data: `
## HI, I'm Xiaomin
`,
      site: {},
    });

    expect(result.data).toBe(
      `
## HI, I'm Xiaomin
`
    );
  });

  it('throws if context not pass', () => {
    expect(() => {
      fmFilter();
    }).toThrow();
  });

  it('throws if data not in context', () => {
    expect(() => {
      fmFilter({
        site: {},
      });
    }).toThrow();
  });

  it('throws if site not in context', () => {
    expect(() => {
      fmFilter({
        data: '',
      });
    }).toThrow();
  });
});
