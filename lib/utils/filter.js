/* eslint-disable no-param-reassign */
// Based on: https://github.com/hexojs/hexo/blob/master/lib/extend/filter.js

class Filter {
  constructor(opts) {
    this.filters = {};
    this.opts = Object.assign({ strict: false, types: [] }, opts);
  }

  register(type, fn) {
    if (!type) throw TypeError('type is required');
    if (typeof fn !== 'function') throw TypeError('fn must be a function');

    if (this.opts.strict && !this.opts.types.includes(type)) {
      throw TypeError(`${type} is not a built-in type`);
    }

    if (!Array.isArray(this.filters[type])) {
      this.filters[type] = [];
    }

    this.filters[type].push(fn);
    return this;
  }

  unregister(type, fn) {
    if (!type) throw TypeError('type is required');
    if (typeof fn !== 'function') throw TypeError('fn must be a function');

    const filters = this.filters[type];
    if (!filters || !filters.length) return this;

    this.filters[type] = this.filters.filter(filter => filter !== fn);
    return this;
  }

  exec(type, ctx, ...args) {
    const filters = this.filters[type];
    const promise = Promise.resolve();
    if (!filters || !filters.length) return promise;

    const reducer = (promises, fn) =>
      promises.then(() => {
        const result = fn(ctx, ...args);
        if (result) ctx = result;
      });
    return filters.reduce(reducer, promise);
  }

  execSync(type, ctx, ...args) {
    const filters = this.filters[type];
    if (!filters || !filters.length) return this;

    filters.forEach((fn) => {
      const result = fn(ctx, ...args);
      if (result) ctx = result;
    });
    return this;
  }
}

module.exports = Filter;
