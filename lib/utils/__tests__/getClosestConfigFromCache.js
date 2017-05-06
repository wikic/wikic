const getClosestConfigFromCache = require('../getClosestConfigFromCache');

jest.mock('../../utils/findParentDir', () => {
  const fn = jest.fn();
  fn.mockReturnValueOnce(null).mockReturnValue('/path');
  return fn;
});

jest.mock('../readYaml', () => {
  const readYaml = jest.fn(() => ({
    field: 'a',
  }));
  return readYaml;
});

describe('getClosetConfigFromCache', () => {
  describe('find cache', () => {
    it('returns cache', async () => {
      const originalConfig = {};
      const caches = {
        dir2dir: {
          '/path/to': '/path',
        },
        dir2conf: {
          '/path': { a: 0 },
        },
      };
      const result = await getClosestConfigFromCache('/path/to', originalConfig, caches);
      expect(result).toEqual({ a: 0 });
    });
  });

  describe('cache not found', () => {
    describe('_config.yml not found', () => {
      it('returns new config', async () => {
        const originalConfig = {};
        const caches = { dir2dir: {}, dir2conf: {} };

        const result = await getClosestConfigFromCache('/path/to', originalConfig, caches);
        expect(result).not.toBe(originalConfig);
        expect(result).toEqual(originalConfig);
      });
    });
    describe('find _config.yml', () => {
      it('returns config and caches config', async () => {
        const originalConfig = {};
        const caches = { dir2dir: {}, dir2conf: {} };

        const result = await getClosestConfigFromCache('/path/to', originalConfig, caches);

        const expected = { field: 'a' };
        expect(result).toEqual(expected);
        expect(caches).toEqual({
          dir2dir: {
            '/path/to': '/path',
          },
          dir2conf: {
            '/path': expected,
          },
        });
      });
    });
  });
});
