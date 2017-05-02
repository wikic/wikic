jest.mock('fs-promise');
jest.mock('chokidar');
jest.mock('../utils/createServer');
jest.mock('../utils/log');
jest.mock('../utils/getList');
jest.mock('../utils/getConfig');

const Wikic = require('../index');
const createServer = require('../utils/createServer');

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

test('serve', async () => {
  const wikic = new Wikic();
  await wikic.serve();
  const { port, getCwd, getBaseurl } = createServer.mock.calls[0][0];
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
