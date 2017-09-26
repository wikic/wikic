jest.mock('../../utils/log')

jest.mock('../../utils/get-config', () => () => ({
  root: '.',
  docsPath: '_note',
  title: 'Wikic Demo',
  baseurl: 'wikic',
  layoutPath: '_layouts',
  publicPath: '../docs',
  page: {
    layout: 'default',
    toc: true,
  },
  suites: [
    () => {
      let now
      return {
        beforeBuild() {
          now = process.uptime()
        },
        afterBuild() {
          // eslint-disable-next-line no-console
          console.log(process.uptime() - now)
        },
      }
    },
    {
      beforeBuild() {},
    },
  ],
}))

const Wikic = require('..')

test('function and object suite', () => {
  const wikic = new Wikic()
  expect(wikic.filter.filters.beforeBuild.length).toBe(2)
  expect(wikic.filter.filters.afterBuild.length).toBe(1)
})

test('module suite not found', () => {
  expect(() => {
    // eslint-disable-next-line no-new
    new Wikic(null, {
      suites: ['moduleA'],
    })
  }).toThrow()
})

test('throws if function suite return falsy', () => {
  expect(() => {
    // eslint-disable-next-line no-new
    new Wikic(null, {
      suites: [() => {}],
    })
  }).toThrow()
})
