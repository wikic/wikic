const Filter = require('../filter')

describe('register', () => {
  it('throws if type not passed', () => {
    const filter = new Filter()
    expect(() => {
      filter.register()
    }).toThrow()
  })
  it('throws if handler not passed', () => {
    const filter = new Filter()
    expect(() => {
      filter.register('type')
    }).toThrow()
  })
  it('throws if not match opts.types', () => {
    const filter = new Filter({
      types: ['_t'],
    })
    expect(() => {
      filter.register('type', () => {})
    }).toThrow()
  })
  it('returns this', () => {
    const filter = new Filter()
    expect(filter.register('type', () => {})).toBe(filter)
  })
})

describe('unregister', () => {
  it('throws if type not passed', () => {
    const filter = new Filter()
    expect(() => {
      filter.unregister()
    }).toThrow()
  })
  it('throws if handler not passed', () => {
    const filter = new Filter()
    expect(() => {
      filter.unregister('type')
    }).toThrow()
  })
  it('returns this if not found', () => {
    const filter = new Filter()
    expect(filter.unregister('type', () => {})).toBe(filter)
  })
  it('unregisters all handlers', () => {
    const filter = new Filter()
    const fn = () => {}
    filter.register('type', fn)
    filter.register('type', fn)
    filter.unregister('type', fn)
    expect(filter.filters.type.length).toBe(0)
  })
})

describe('exec', () => {
  it('works if not yet register', async () => {
    const filter = new Filter()
    await filter.exec('type')
  })
  it('save context if it is not falsy', async () => {
    const filter = new Filter()
    filter.register('type', (ctx) => {
      expect(ctx).toBe(null)
      return 1
    })
    filter.register('type', (ctx) => {
      expect(ctx).toBe(1)
      return Promise.resolve(2)
    })
    filter.register('type', (ctx) => {
      expect(ctx).toBe(2)
    })
    filter.register('type', (ctx) => {
      expect(ctx).toBe(2)
    })
    await filter.exec('type', null)
  })
})

describe('execSync', () => {
  it('works if not yet register', () => {
    const filter = new Filter()
    filter.execSync('type')
  })
  it('save context if it is not falsy', () => {
    const filter = new Filter()
    filter.register('type', (ctx) => {
      expect(ctx).toBe(null)
      return 2
    })
    filter.register('type', (ctx) => {
      expect(ctx).toBe(2)
    })
    filter.register('type', (ctx) => {
      expect(ctx).toBe(2)
    })
    filter.execSync('type', null)
  })
})
