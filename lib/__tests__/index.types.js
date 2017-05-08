const Wikic = require('../index');

jest.mock('../utils/log');
jest.mock('../plugins/load');
jest.mock('../utils/getConfig');

describe('type of docs', () => {
  it('baseurl works', () => {
    const wikic = new Wikic();
    wikic.config.baseurl = 'note';
    expect(wikic.getURL('')).toBe('/note');
    expect(wikic.getURL('css/main.css')).toBe('/note/css/main.css');
    expect(wikic.getURL('/css/main.css')).toBe('/note/css/main.css');
  });

  it('typeMap', () => {
    const wikic = new Wikic();
    expect(wikic.typeMap('css')).toBe('CSS');
    expect(wikic.typeMap('bash')).toBe('Bash');
  });
});
