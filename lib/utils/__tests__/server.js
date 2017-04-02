const server = require('../server')
const http = require('http')
const path = require('path')

/* eslint-disable no-underscore-dangle */

const requestStat = url => new Promise((resolve) => {
  http.get(url, (res) => {
    resolve(res.statusCode)
  })
})

describe('server', () => {
  it('throws if listen without create', () => {
    expect(() => {
      server.listen()
    }).toThrow()
  })

  it('default cwd is process.cwd()', () => {
    server.create({})
    expect(server.cwd).toBe(process.cwd())
  })

  describe('basename not set', () => {
    beforeAll(() => {
      server.create({
        port: 4500,
        getCwd: () => path.resolve(process.cwd(), 'docs'),
      }).listen()
    })

    afterAll(() => {
      server.close()
    })

    it('should return 200', async () => {
      const code = await requestStat('http://127.0.0.1:4500/')
      expect(code).toBe(200)
    })

    it('should return 404', async () => {
      const code = await requestStat('http://127.0.0.1:4500/somethingnotexist')
      expect(code).toBe(404)
    })
  })

  describe('basename set', () => {
    beforeAll(() => {
      server.create({
        port: 4500,
        getCwd: () => path.resolve(process.cwd(), 'docs'),
        getBaseurl: () => 'wikic',
      }).listen()
    })

    afterAll(() => {
      server.close()
    })

    it('should return 200', async () => {
      const code = await requestStat('http://127.0.0.1:4500/wikic')
      expect(code).toBe(200)
    })

    it('should return 404', async () => {
      const code = await requestStat('http://127.0.0.1:4500/')
      expect(code).toBe(404)
    })
  })
})
