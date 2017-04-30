jest.mock('fs-promise');
jest.mock('chokidar');
jest.mock('../utils/server');
jest.mock('../utils/log');
jest.mock('../utils/getList');
jest.mock('../utils/getConfig');

const Wikic = require('../index');
const server = require('../utils/server');
/* eslint-disable no-underscore-dangle */
test('has these properties', () => {
  const wikic = new Wikic();
  expect(wikic).toHaveProperty('root');
  expect(wikic).toHaveProperty('publicPath');
  expect(wikic).toHaveProperty('layoutPath');
  expect(wikic).toHaveProperty('docsPath');
  expect(wikic).toHaveProperty('config');
  expect(wikic).toHaveProperty('_getListOpts');
  expect(wikic).toHaveProperty('_building');
  expect(wikic).toHaveProperty('_afterReadTasks');
  expect(wikic).toHaveProperty('_beforeWriteTasks');
});

test('serve', () => {
  const wikic = new Wikic();
  expect(wikic.serve()).toBe(wikic);
  const { port, getCwd, getBaseurl } = server.create.mock.calls[0][0];
  expect(port).toBe(wikic.config.port);
  expect(getBaseurl()).toBe(wikic.config.baseurl);
  expect(getCwd()).toBe(wikic.publicPath);
});

describe('setListTemplate', () => {
  it('throws if opts not passed', () => {
    const wikic = new Wikic();
    expect(() => {
      wikic.setListTemplate();
    }).toThrow();
  });

  it('throws if opts not passed', () => {
    const wikic = new Wikic();
    const opts = {};
    wikic.setListTemplate(opts);
    expect(wikic._getListOpts).toBe(opts);
  });
});
