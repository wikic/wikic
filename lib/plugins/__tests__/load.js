const load = require('../load');

jest.mock('fs-promise');
jest.mock('../../utils/getClosestConfig', () => jest.fn((srcDir, site) => Object.assign({}, site)));
jest.mock('../../utils/getClosestConfigFromCache', () => jest.fn((srcDir, site) => Object.assign({}, site)));

const getClosestConfigFromCache = require('../../utils/getClosestConfigFromCache');
const getClosestConfig = require('../../utils/getClosestConfig');

describe('load Plugins', () => {
  it('should save property into context', async () => {
    const result = await load({
      data: '',
      site: {},
      otherKey: true,
      src: '/path/to/',
    });
    expect(result.otherKey).toBeTruthy();
  });

  it('throws if context is not passed as an object', async () => {
    try {
      await load();
    } catch (error) {
      expect(error.message).toBe('should pass a object to load.');
    }
  });

  it('throws if context.src is not passed as a string', async () => {
    try {
      await load({
        site: {},
      });
    } catch (error) {
      expect(error.message).toBe('context.src must be a string.');
    }
  });

  it('throws if context.site is not passed as a object', async () => {
    try {
      await load({
        src: '/path/to',
      });
    } catch (error) {
      expect(error.message).toBe('context.site must be passed as a object.');
    }
  });

  it('invokes getClosestConfig default', async () => {
    getClosestConfig.mockClear();
    getClosestConfigFromCache.mockClear();
    const site = {};
    await load({
      data: '',
      site,
      src: '/path/to/something.md',
    });
    expect(getClosestConfig)
      .toHaveBeenCalledWith('/path/to', site);
  });

  it('invokes getClosestConfigFromCache if has configCaches', async () => {
    getClosestConfig.mockClear();
    getClosestConfigFromCache.mockClear();
    const site = {};
    const configCaches = { dir2dir: {}, dir2conf: {} };
    await load({
      data: '',
      src: '/path/to/something.md',
      site,
      configCaches,
    });
    expect(getClosestConfigFromCache)
      .toHaveBeenCalledWith('/path/to', site, configCaches);
  });
});
