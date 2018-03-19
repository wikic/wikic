// Based on: https://github.com/hexojs/hexo/blob/master/lib/extend/filter.js

class Filter {
  constructor(opts) {
    this.filters = {}
    this.opts = Object.assign({ types: [] }, opts)
  }

  register(type, fn) {
    if (!type) throw TypeError('type is required')
    if (typeof fn !== 'function') throw TypeError('fn must be a function')

    if (this.opts.types.length > 0 && !this.opts.types.includes(type)) {
      throw TypeError(`${type} is not a built-in type`)
    }

    if (!Array.isArray(this.filters[type])) {
      this.filters[type] = []
    }

    this.filters[type].push(fn)
    return this
  }

  unregister(type, fn) {
    if (!type) throw TypeError('type is required')
    if (typeof fn !== 'function') throw TypeError('fn must be a function')

    const filters = this.filters[type]
    if (!filters || !filters.length) return this

    this.filters[type] = filters.filter(filter => filter !== fn)
    return this
  }

  exec(type, ctx, ...args) {
    const filters = this.filters[type]
    const promise = Promise.resolve(ctx)
    if (!filters || !filters.length) return promise
    let lastCtx = ctx
    let p = promise
    filters.forEach(fn => {
      p = p.then(r => {
        if (r) {
          lastCtx = r
        }
        return fn(lastCtx, ...args)
      })
    })
    return p.then(r => r || lastCtx)
  }

  execSync(type, ctx, ...args) {
    const filters = this.filters[type]
    if (!filters || !filters.length) return ctx

    let lastCtx = ctx
    filters.forEach(fn => {
      const result = fn(lastCtx, ...args)
      if (result) lastCtx = result
    })
    return lastCtx
  }
}

module.exports = Filter
