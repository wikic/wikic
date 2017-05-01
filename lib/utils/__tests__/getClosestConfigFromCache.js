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
  it('returns new config if _config.yml not found', async () => {
    const originalConfig = {};
    const caches = { dir2dir: {}, dir2conf: {} };

    const result = await getClosestConfigFromCache('/path/to', originalConfig, caches);
    expect(result).not.toBe(originalConfig);
    expect(result).toEqual(originalConfig);
  });

  it('returns cache if find', async () => {
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

  it('returns config and caches config', async () => {
    const originalConfig = {};
    const caches = { dir2dir: {}, dir2conf: {} };

    const result = await getClosestConfigFromCache('/path/to', originalConfig, caches);

    expect(result).toEqual({ field: 'a' });
    expect(caches).toEqual({
      dir2dir: {
        '/path/to': '/path',
      },
      dir2conf: {
        '/path': { field: 'a' },
      },
    });
  });
});

