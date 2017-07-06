const mdFilter = require('../markdown');

describe('mdFilter', () => {
  it('should save property into context', () => {
    expect(
      mdFilter({
        data: '',
        site: {},
        otherKey: true,
      }).otherKey
    ).toBeTruthy();
  });

  it('should not touch site', () => {
    const site = {};
    const result = mdFilter({
      data: '',
      site,
    });
    expect(result.site).toBe(site);
    expect(result.site).toEqual(site);
  });

  it('should render markdown', () => {
    const result = mdFilter({
      data: '# Markdown',
      site: {},
    });
    expect(result.data).toMatch(/<h1>/);
  });

  it('should render codeblock', () => {
    const result = mdFilter({
      data: '``` javascript\nif(true) console.log("yes")\n```',
      site: {},
    });
    expect(result.data).toMatch(/hljs-literal/);
  });

  it('do not exist if not find lang', () => {
    let result;
    expect(() => {
      result = mdFilter({
        data: '``` _a__kindoflang\no_0 ha?\n```',
        site: {},
      });
    }).not.toThrow();
    expect(result.data).toMatch('<code>o_0 ha?');
  });

  it('should overwrite default', () => {
    const actual = mdFilter({
      data: 'https://baidu.com',
      site: {
        markdownIt: {
          linkify: false,
        },
      },
    });
    expect(actual.data).toBe('<p>https://baidu.com</p>\n');
  });
});
