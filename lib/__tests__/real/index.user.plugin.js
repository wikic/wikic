/* eslint-disable no-underscore-dangle */
jest.mock('../../utils/log');

jest.mock('../../../example/wikic.config.js', () => {
  const exports = {
    title: 'Wikic',
    beforeWritePlugins: [context => context],
  };
  return exports;
});

const config = require('../../../example/wikic.config.js');
const Wikic = require('../..');

test('user plugins', () => {
  const wikic = new Wikic('example');
  expect(wikic._beforeWritePlugins.pop()).toBe(config.beforeWritePlugins[0]);
});
