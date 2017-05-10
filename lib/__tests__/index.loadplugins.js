/* eslint-disable no-underscore-dangle */
jest.mock('../utils/log');

const Wikic = require('../index');

jest.mock('../../example/wikic.config.js', () => {
  const exports = {
    beforeWritePlugins: [context => context],
    listTemplate: {},
  };
  return exports;
});

describe('_loadPlugins', () => {
  it('works', () => {
    const wikic = new Wikic('example');
    const obj = {};
    expect(wikic._beforeWritePlugins[wikic._beforeWritePlugins.length - 1](obj)).toBe(obj);
    expect(wikic._getListOpts).not.toBe(undefined);
  });
});
