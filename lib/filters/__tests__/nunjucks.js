jest.mock('../../utils/log');
jest.unmock('nunjucks');

const logger = require('../../utils/log');
const njFilter = require('../nunjucks');
const nunjucks = require('nunjucks');

const wikic = { renderer: nunjucks };

describe('njFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('escape', () => {
    it('works via {% raw %}', () => {
      const context = {
        src: '/path/to/',
        data: '{% raw %}{{ page.title }}{% endraw %}',
        page: {
          title: 'title',
        },
      };
      const result = njFilter(context, wikic);
      expect(result.data).toBe('{{ page.title }}');
    });

    it('works via <code>', () => {
      const context = {
        src: '/path/to/',
        data: '<code>{{ page.title }}</code>',
        page: {
          title: 'title',
        },
      };
      const result = njFilter(context, wikic);
      expect(result.data).toBe('<code>{{ page.title }}</code>');
    });
  });

  describe('variable', () => {
    it('works', () => {
      const context = {
        src: '/path/to/',
        data: '{{ page.title }}',
        page: {
          title: 'title',
        },
      };
      const result = njFilter(context, wikic);
      expect(result.data).toBe('title');
    });

    it('handles syntax mistakes', () => {
      njFilter(
        {
          src: '/path/to/variable',
          data: '{{ }}',
        },
        wikic
      );
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/variable');
    });
  });

  describe('block', () => {
    it('works', () => {
      const { data } = njFilter(
        {
          src: '/path/to/block',
          data: '{% if page.title %}{{ page.title }}{% endif %}',
          page: {
            title: 'title',
          },
        },
        wikic
      );
      expect(data).toMatch('title');
      expect(logger.warn.mock.calls.length).toBe(0);
    });

    it('handles syntax mistakes', () => {
      njFilter(
        {
          src: '/path/to/block',
          data: '{% page.title %}',
          page: {
            title: 'title',
          },
        },
        wikic
      );
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/block');
    });
  });

  describe('comment', () => {
    it('handles syntax mistakes', () => {
      njFilter(
        {
          src: '/path/to/comment',
          data: '{# page.title',
          page: {
            title: 'title',
          },
        },
        wikic
      );
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/comment');
    });
  });
});
