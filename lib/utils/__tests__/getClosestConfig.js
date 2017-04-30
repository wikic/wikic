const getClosestConfig = require('../getClosestConfig');

jest.mock('../../utils/findParentDir', () => {
  const fn = jest.fn();
  fn.mockReturnValueOnce(null).mockReturnValue('/path/');
  return fn;
});

jest.mock('../readYaml', () => {
  const readYaml = jest.fn(() => ({
    field: 'a',
    toc: {
      selectors: 'h2 h3',
    },
  }));
  return readYaml;
});

describe('getClosestConfig', () => {
  it('parent _config.yml not found', async () => {
    expect(await getClosestConfig('/path/to/', {})).toEqual({});
  });

  it('found Parent Config', async () => {
    expect(await getClosestConfig('/path/to/it/', {})).toEqual({
      field: 'a',
      toc: {
        selectors: 'h2 h3',
      },
    });
  });

  it('returns a new object', async () => {
    const defaultConfig = {};
    expect(await getClosestConfig('/path/to/', defaultConfig)).not.toBe(defaultConfig);
  });

  it('deep extend', async () => {
    const defaultConfig = {
      toc: {
        selectors: 'h1 h2',
        id: '#toc',
      },
    };

    expect(await getClosestConfig('/path/to/', defaultConfig)).toEqual({
      field: 'a',
      toc: {
        selectors: 'h2 h3',
        id: '#toc',
      },
    });
  });
});
