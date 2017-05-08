/* eslint-disable no-underscore-dangle */
jest.mock('../utils/log');

const Wikic = require('../index');

jest.mock('../../example/_plugins.js', () => {
  const exports = {
    beforeWritePlugins: [context => context],
    listTemplate: {},
  };
  return exports;
});

describe('_loadPlugins', () => {
  describe('find _plugins.js', () => {
    it('works', () => {
      const wikic = new Wikic('example');
      const addPlugin = jest.spyOn(wikic, 'addPlugin');
      wikic._loadPlugins();
      const obj = {};
      expect(wikic._beforeWritePlugins[wikic._beforeWritePlugins.length - 1](obj)).toBe(obj);
      expect(addPlugin).toHaveBeenCalled();
      expect(wikic._getListOpts).not.toBe(undefined);
    });
  });
});
