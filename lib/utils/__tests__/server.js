/* eslint-disable no-underscore-dangle */
jest.mock('../log')
jest.mock('fs-promise', () => {
  const fsp = jest.genMockFromModule('fs-promise')
  const cwd = process.cwd()
  const _paths = ['404.html', 'index.html', '']

  let paths
  let errorRead

  fsp.__reset = () => {
    paths = _paths
    errorRead = false
  }

  fsp.__reset()

  const findFile = (file) => {
    const files = paths
      .map(pathname => [cwd, 'docs', pathname].join('/'))
      .map(pathname => pathname.replace(/\/$/, ''))
    return files.includes(file)
  }

  fsp.__setPaths = (pathArray) => { paths = pathArray }

  fsp.__toggleReadThrows = () => { errorRead = !errorRead }

  fsp.access = (filePath) => {
    if (findFile(filePath)) {
      return Promise.resolve()
    }
    return Promise.reject(Error('cannot access'))
  }

  fsp.readFile = jest.fn(
    (file) => {
      if (errorRead) {
        throw Error(`cannot read ${file}`)
      }
      return ''
    }
  )

  fsp.stat = (filePath) => {
    if (!findFile(filePath)) return Promise.reject(Error('cannot access'))
    if (!/.+\..+/.test(filePath)) {
      return {
        isDirectory: () => true,
      }
    }
    return {
      isDirectory: () => false,
    }
  }

  return fsp
})

const server = require('../server')
const http = require('http')
const path = require('path')
const fsp = require('fs-promise')

/* eslint-disable no-underscore-dangle */
const port = 3456

const request = url => new Promise((resolve) => {
  http.get(url, (res) => {
    resolve(res)
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
        port,
        getCwd: () => path.resolve('docs'),
      }).listen()
    })

    afterAll(() => {
      server.close()
    })

    it('should return 200', async () => {
      const req = await request(`http://127.0.0.1:${port}/`)
      expect(req.statusCode).toBe(200)
    })

    it('should return 404', async () => {
      const req = await request(`http://127.0.0.1:${port}/somethingnotexist`)
      expect(req.statusCode).toBe(404)
    })

    it('response 500 if err occur when reading file', async () => {
      fsp.__toggleReadThrows()
      const req = await request(`http://127.0.0.1:${port}/somethingnotexist`)
      expect(req.statusCode).toBe(500)
      fsp.__reset()
    })

    it('should return 404', async () => {
      fsp.__setPaths(['', 'index.html'])
      const req = await request(`http://127.0.0.1:${port}/somethingnotexist`)
      expect(req.statusCode).toBe(404)
      fsp.__reset()
    })

    it('undefined mimeType', async () => {
      fsp.__setPaths(['whatever.extname'])
      const req = await request(`http://127.0.0.1:${port}/whatever.extname`)
      expect(req.statusCode).toBe(200)
      expect(req.headers['content-type']).toBe('text/plain')
      fsp.__reset()
    })
  })

  describe('basename set', () => {
    beforeAll(() => {
      server.create({
        port,
        getCwd: () => path.resolve('docs'),
        getBaseurl: () => 'wikic',
      }).listen()
    })

    afterAll(() => {
      server.close()
    })

    it('should return 200', async () => {
      const req = await request(`http://127.0.0.1:${port}/wikic`)
      expect(req.statusCode).toBe(200)
    })

    it('should return 404', async () => {
      const { statusCode } = await request(`http://127.0.0.1:${port}/`)
      expect(statusCode).toBe(404)
    })
  })

  describe('dynamic baseurl', () => {
    it('works', async () => {
      let baseurl = 'b1'
      jest.resetModules()
      server.create({
        port,
        getCwd: () => path.resolve('docs'),
        getBaseurl: () => baseurl,
      }).listen()

      expect((await request(`http://127.0.0.1:${port}/b1`)).statusCode).toBe(200)
      baseurl = 'b2'
      expect((await request(`http://127.0.0.1:${port}/b1`)).statusCode).toBe(404)
      expect((await request(`http://127.0.0.1:${port}/b2`)).statusCode).toBe(200)
      server.close()
    })
  })
})
