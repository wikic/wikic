const getClosestConfig = require('../getClosestConfig');

jest.mock('../../utils/findParentDir', () => {
  const fn = jest.fn();
  fn.mockReturnValueOnce(null).mockReturnValue('/path/');
  return fn;
});

jest.mock('../readYaml', () => {
  const readYaml = jest.fn(() => ({
    field: 'a',
    empty: null,
    toc: {
      selectors: 'h2 h3',
    },
  }));
  return readYaml;
});

describe('getClosestConfig', () => {
  it('_config.yml not found', async () => {
    expect(await getClosestConfig('/path/to/', {})).toEqual({});
  });

  describe('find _config.yml', () => {
    it('ignore null field', async () => {
      expect(await getClosestConfig('/path/to/it/', { empty: 0 })).toEqual({
        field: 'a',
        toc: {
          selectors: 'h2 h3',
        },
        empty: 0,
      });
    });

    it('returns a new object', async () => {
      const defaultConfig = {};
      expect(await getClosestConfig('/path/to/', defaultConfig)).not.toBe(defaultConfig);
    });

    it('deep extend works', async () => {
      const defaultConfig = {
        toc: {
          selectors: 'h1 h2',
          id: '#toc',
        },
      };

      expect((await getClosestConfig('/path/to/', defaultConfig)).toc).toEqual({
        selectors: 'h2 h3',
        id: '#toc',
      });
    });
  });
});
