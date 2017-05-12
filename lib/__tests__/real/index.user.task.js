/* eslint-disable no-underscore-dangle */
jest.mock('../../utils/log');

jest.mock('../../../example/wikic.config.js', () => {
  const exports = {
    title: 'Wikic',
    beforeBuildTasks: [jest.fn()],
  };
  return exports;
});

const config = require('../../../example/wikic.config.js');
const Wikic = require('../..');

test('user tasks', () => {
  const wikic = new Wikic('example');
  expect(wikic._beforeBuildTasks.pop()).toBe(config.beforeBuildTasks[0]);
});
