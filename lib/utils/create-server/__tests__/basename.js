/* eslint-disable no-underscore-dangle */
jest.mock('../../log')

const createServer = require('..')
const path = require('path')
const request = require('./helpers/request')

/* eslint-disable no-underscore-dangle */
const port = 0

describe('server', () => {
  describe('basename set', () => {
    let server
    beforeAll(async () => {
      server = (await createServer({
        port,
        getCwd: () => path.resolve('docs'),
        getBaseurl: () => 'wikic',
      })).listen()
    })

    afterAll(() => {
      server.close()
    })

    it('should return 200', async () => {
      const req = await request(`http://127.0.0.1:${server.port}/wikic`)
      expect(req.statusCode).toBe(200)
    })

    it('should return 404', async () => {
      const { statusCode } = await request(`http://127.0.0.1:${server.port}/`)
      expect(statusCode).toBe(404)
    })
  })

  describe('basename extra set', () => {
    let server
    beforeAll(async () => {
      server = (await createServer({
        port,
        getCwd: () => path.resolve('docs'),
        getBaseurl: () => 'a/b',
      })).listen()
    })

    afterAll(() => {
      server.close()
    })

    it('should return 200', async () => {
      const req = await request(`http://127.0.0.1:${server.port}/a/b`)
      expect(req.statusCode).toBe(200)
    })

    it('should return 404', async () => {
      const { statusCode } = await request(`http://127.0.0.1:${server.port}/a`)
      expect(statusCode).toBe(404)
    })
  })

  describe('dynamic baseurl', () => {
    it('works', async () => {
      let baseurl = 'b1'
      // jest.resetModules();
      const server = (await createServer({
        port,
        getCwd: () => path.resolve('docs'),
        getBaseurl: () => baseurl,
      })).listen()

      expect((await request(`http://127.0.0.1:${server.port}/b1`)).statusCode).toBe(200)
      baseurl = 'b2'
      expect((await request(`http://127.0.0.1:${server.port}/b1`)).statusCode).toBe(404)
      expect((await request(`http://127.0.0.1:${server.port}/b2`)).statusCode).toBe(200)
      server.close()
    })
  })
})
