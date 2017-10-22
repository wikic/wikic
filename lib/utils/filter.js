/* eslint-disable no-param-reassign */
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

  async exec(type, ctx, ...args) {
    const filters = this.filters[type]
    const promise = Promise.resolve(ctx)
    if (!filters || !filters.length) return promise
    const reducer = (promises, fn) =>
      promises.then((ret) => {
        if (ret) {
          ctx = ret
        }
        return fn(ctx, ...args)
      })
    return await filters.reduce(reducer, promise) || ctx
  }

  execSync(type, ctx, ...args) {
    const filters = this.filters[type]
    if (!filters || !filters.length) return ctx

    filters.forEach((fn) => {
      const result = fn(ctx, ...args)
      if (result) ctx = result
    })
    return ctx
  }
}

module.exports = Filter
