/* eslint-disable no-underscore-dangle */

jest.mock('fs-extra');
jest.mock('chokidar');
jest.mock('nunjucks');

jest.mock('../utils/glob');
jest.mock('../utils/createServer');
jest.mock('../utils/log');
jest.mock('../utils/getConfig');
jest.mock('../plugins/addTOC');
jest.mock('../plugins/load');
jest.mock('../utils/getList');

const chokidar = require('chokidar');
const Wikic = require('../index');
const glob = require('../utils/glob');
const logger = require('../utils/log');
const fse = require('fs-extra');
const path = require('path');

glob.__setPath('**/*', ['404.md', 'styles/main.css']);
glob.__setPath('**/*.md', ['css/flexbox.md', 'html/hi.md']);
glob.__setPath('**/', ['css/', 'html/']);

describe('wikic build', () => {
  describe('addPlugin', () => {
    it('works', async () => {
      const wikic = new Wikic();
      const plugin = jest.fn(context => context);
      const length = wikic._beforeWritePlugins.length;

      expect(wikic.addPlugin('beforeWrite', plugin)).toBe(wikic);
      expect(wikic._beforeWritePlugins.length).toBe(length + 1);
      await wikic.build();
      expect(plugin.mock.calls.length).not.toBeLessThan(1);
    });

    it('throws if not pass a function', () => {
      const wikic = new Wikic();
      expect(() => {
        wikic.addPlugin();
      }).toThrow('should pass a function');
    });

    it('throws if plugin key not pass', () => {
      const wikic = new Wikic();
      const plugin = context => context;
      expect(() => {
        wikic.addPlugin('something', plugin);
      }).toThrow();
    });
  });

  describe('build', () => {
    it('call build() will call once only', () => {
      logger.error.mockClear();
      const wikic = new Wikic();
      wikic.build();
      wikic.build();
      expect(logger.error.mock.calls.length).toBe(1);
    });
  });

  describe('_readMD', () => {
    it('works if src not in context', async () => {
      const wikic = new Wikic();
      await wikic._readMD({
        data: '',
        site: {},
        dist: 'a.html',
      });
    });
  });

  describe('nunjucks', () => {
    it('baseurl, typeMap, typeMaps Filter', () => {
      const wikic = new Wikic();
      expect(wikic.renderer.addFilter).toHaveBeenCalledTimes(3);
      wikic.config.baseurl = 'base';
      expect(wikic.renderer.addFilter.mock.calls[0][0]).toBe('baseurl');
      expect(wikic.renderer.addFilter.mock.calls[0][1]('a/b/c')).toBe(wikic.getURL('a/b/c'));

      expect(wikic.renderer.addFilter.mock.calls[1][0]).toBe('typeMap');
      expect(wikic.renderer.addFilter.mock.calls[1][1]('css')).toBe(wikic.typeMap('css'));

      expect(wikic.renderer.addFilter.mock.calls[2][0]).toBe('typeMaps');
      expect(wikic.renderer.addFilter.mock.calls[2][1](['css', 'html'])).toEqual(['CSS', 'HTML']);
    });

    it('relative Filter', () => {
      const wikic = new Wikic();
      wikic.renderer.addFilter.mockClear();
      wikic._renderMD({
        data: '',
        page: {
          address: '/base/c/d.html',
        },
        renderContext: {},
        dist: path.resolve('a', 'b', 'c', 'd.html'),
      });
      expect(wikic.renderer.addFilter).toHaveBeenCalledTimes(1);
      expect(wikic.renderer.addFilter.mock.calls[0][0]).toBe('relative');
      expect(wikic.renderer.addFilter.mock.calls[0][1]('/base/c/f.html')).toBe('f.html');
    });
  });
});

describe('watch', () => {
  it('works', () => {
    logger.error.mockClear();
    const wikic = new Wikic();
    wikic.watch();
    const setup = jest.spyOn(wikic, 'setup');
    const build = jest.spyOn(wikic, 'build');

    chokidar.__emiter.emit('change', '/path/to/');
    expect(setup).toHaveBeenCalled();
    expect(build).toHaveBeenCalled();
    setup.mockReset();
    setup.mockRestore();
    build.mockReset();
    build.mockRestore();

    chokidar.__emiter.emit('unlink', 'text.txt');
    expect(fse.removeSync.mock.calls[0][0]).toMatch(path.join('docs', 'text.txt'));

    chokidar.__emiter.emit('error', Error('oops'));
    expect(logger.error.mock.calls.length).toBe(1);
    expect(logger.error.mock.calls[0][0]).toMatch('Error: oops');
  });

  test('ignored', () => {
    const wikic = new Wikic();

    chokidar.watch.mockClear();
    wikic.config.layoutPath = '_layout';
    wikic.config.docsPath = '_doc';
    wikic.watch();
    expect(chokidar.watch.mock.calls[0][1].ignored.pop()).toBe('_!(layout|doc)/**');

    chokidar.watch.mockClear();
    wikic.config.layoutPath = 'layout';
    wikic.config.docsPath = 'doc';
    wikic.watch();
    expect(chokidar.watch.mock.calls[0][1].ignored.pop()).toBe('_*/**');
  });
});

describe('clean', async () => {
  const wikic = new Wikic();
  expect(await wikic.clean()).toBe(wikic);
  expect(fse.emptyDir.mock.calls[0][0]).toBe(wikic.publicPath);
});
