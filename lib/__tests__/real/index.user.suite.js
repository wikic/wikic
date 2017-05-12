/* eslint-disable no-underscore-dangle */
jest.mock('../../utils/log');

jest.mock('../../../example/wikic.config.js', () => {
  const exports = {
    title: 'Wikic',
    suites: [
      {
        beforeWrite: context => context,
        beforeBuild: jest.fn(),
      },
    ],
  };
  return exports;
});

const config = require('../../../example/wikic.config.js');
const Wikic = require('../..');

test('user suite', () => {
  const wikic = new Wikic('example');
  expect(wikic._beforeBuildTasks.pop()).toBe(config.suites[0].beforeBuild);
  expect(wikic._beforeWritePlugins.pop()).toBe(config.suites[0].beforeWrite);
});
