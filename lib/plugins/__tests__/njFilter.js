const logger = require('../../utils/log')
const njFilter = require('../njFilter')

jest.mock('../../utils/log')
jest.unmock('nunjucks')

describe('njFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('escape', () => {
    it('works via {% raw %}', () => {
      expect(
        njFilter({
          from: '/path/to/',
          data: '{% raw %}{{ page.title }}{% endraw %}',
          renderContext: {
            page: {
              title: 'title',
            },
          },
        }).data
      ).toBe('{{ page.title }}')
    })

    it('works via <code>', () => {
      expect(
        njFilter({
          from: '/path/to/',
          data: '<code>{{ page.title }}</code>',
          renderContext: {
            page: {
              title: 'title',
            },
          },
        }).data
      ).toBe('<code>{{ page.title }}</code>')
    })
  })

  describe('variable', () => {
    it('works', () => {
      expect(
        njFilter({
          from: '/path/to/',
          data: '{{ page.title }}',
          renderContext: {
            page: {
              title: 'title',
            },
          },
        }).data
      ).toBe('title')
    })

    it('handles syntax mistakes', () => {
      njFilter({
        from: '/path/to/variable',
        data: '{{ }}',
      })
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/variable')
    })
  })

  describe('block', () => {
    it('works', () => {
      const { data } = njFilter({
        from: '/path/to/block',
        data: '{% if page.title %}{{ page.title }}{% endif %}',
        renderContext: {
          page: {
            title: 'title',
          },
        },
      })
      expect(data).toMatch('title')
      expect(logger.warn.mock.calls.length).toBe(0)
    })

    it('handles syntax mistakes', () => {
      njFilter({
        from: '/path/to/block',
        data: '{% page.title %}',
        renderContext: {
          page: {
            title: 'title',
          },
        },
      })
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/block')
    })
  })

  describe('comment', () => {
    it('handles syntax mistakes', () => {
      njFilter({
        from: '/path/to/comment',
        data: '{# page.title',
        renderContext: {
          page: {
            title: 'title',
          },
        },
      })
      expect(logger.warn.mock.calls[0][0]).toMatch('/path/to/comment')
    })
  })
})
