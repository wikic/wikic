jest.mock('../../utils/log');
jest.unmock('nunjucks');

const logger = require('../../utils/log');
const njFilter = require('../njFilter');
const nunjucks = require('nunjucks');

const wikic = { renderer: nunjucks };

describe('njFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('escape', () => {
    it('works via {% raw %}', () => {
      expect(
        njFilter.call(wikic, {
          src: '/path/to/',
          data: '{% raw %}{{ page.title }}{% endraw %}',
          page: {
            title: 'title',
          },
        }).data
      ).toBe('{{ page.title }}');
    });

    it('works via <code>', () => {
      expect(
        njFilter.call(wikic, {
          src: '/path/to/',
          data: '<code>{{ page.title }}</code>',
          page: {
            title: 'title',
          },
        }).data
      ).toBe('<code>{{ page.title }}</code>');
    });
  });

  describe('variable', () => {
    it('works', () => {
      expect(
        njFilter.call(wikic, {
          src: '/path/to/',
          data: '{{ page.title }}',
          page: {
            title: 'title',
          },
        }).data
      ).toBe('title');
    });

    it('handles syntax mistakes', () => {
      njFilter.call(wikic, {
        src: '/path/to/variable',
        data: '{{ }}',
      });
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/variable');
    });
  });

  describe('block', () => {
    it('works', () => {
      const { data } = njFilter.call(wikic, {
        src: '/path/to/block',
        data: '{% if page.title %}{{ page.title }}{% endif %}',
        page: {
          title: 'title',
        },
      });
      expect(data).toMatch('title');
      expect(logger.warn.mock.calls.length).toBe(0);
    });

    it('handles syntax mistakes', () => {
      njFilter.call(wikic, {
        src: '/path/to/block',
        data: '{% page.title %}',
        page: {
          title: 'title',
        },
      });
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/block');
    });
  });

  describe('comment', () => {
    it('handles syntax mistakes', () => {
      njFilter.call(wikic, {
        src: '/path/to/comment',
        data: '{# page.title',
        page: {
          title: 'title',
        },
      });
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/comment');
    });
  });
});
