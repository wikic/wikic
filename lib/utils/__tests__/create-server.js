/* eslint-disable no-underscore-dangle */
jest.mock('../log');
jest.mock('fs-extra', () => {
  const fse = jest.genMockFromModule('fs-extra');
  const cwd = process.cwd();
  const _paths = ['404.html', 'index.html', ''];

  let paths;
  let errorRead;

  fse.__reset = () => {
    paths = _paths;
    errorRead = false;
  };

  fse.__reset();

  let findFile;
  if (process.platform === 'win32') {
    findFile = (file) => {
      const files = paths
        .map(pathname => [cwd, 'docs', pathname].join('\\'))
        .map(pathname => pathname.replace(/\\$/, ''));
      return files.includes(file);
    };
  } else {
    findFile = (file) => {
      const files = paths
        .map(pathname => [cwd, 'docs', pathname].join('/'))
        .map(pathname => pathname.replace(/\/$/, ''));
      return files.includes(file);
    };
  }

  fse.__setPaths = (pathArray) => {
    paths = pathArray;
  };

  fse.__toggleReadThrows = () => {
    errorRead = !errorRead;
  };

  fse.access = jest.fn((filePath) => {
    if (findFile(filePath)) {
      return Promise.resolve();
    }
    return Promise.reject(Error('cannot access'));
  });

  fse.readFile = jest.fn((file) => {
    if (errorRead) {
      throw Error(`cannot read ${file}`);
    }
    return '';
  });

  fse.stat = jest.fn((filePath) => {
    if (!findFile(filePath)) return Promise.reject(Error('cannot access'));
    if (!/.+\..+/.test(filePath)) {
      return {
        isDirectory: () => true,
      };
    }
    return {
      isDirectory: () => false,
    };
  });

  return fse;
});

const createServer = require('../create-server');
const http = require('http');
const path = require('path');
const fse = require('fs-extra');

/* eslint-disable no-underscore-dangle */
const port = 0;

const request = url =>
  new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res);
    });
  });

describe('server', () => {
  it('default cwd is process.cwd()', async () => {
    const server = await createServer({});
    expect(server.cwd).toBe(process.cwd());
  });

  describe('basename not set', () => {
    let server;
    beforeAll(async () => {
      server = (await createServer({
        port,
        getCwd: () => path.resolve('docs'),
      })).listen();
    });

    afterAll(() => {
      server.close();
    });

    it('should return 200', async () => {
      const req = await request(`http://127.0.0.1:${server.port}/`);
      expect(req.statusCode).toBe(200);
    });

    it('should return 404', async () => {
      const req = await request(`http://127.0.0.1:${server.port}/somethingnotexist`);
      expect(req.statusCode).toBe(404);
    });

    it('response 500 if err occur when reading file', async () => {
      fse.__toggleReadThrows();
      const req = await request(`http://127.0.0.1:${server.port}/somethingnotexist`);
      expect(req.statusCode).toBe(500);
      fse.__reset();
    });

    it('should return 404', async () => {
      fse.__setPaths(['', 'index.html']);
      const req = await request(`http://127.0.0.1:${server.port}/somethingnotexist`);
      expect(req.statusCode).toBe(404);
      fse.__reset();
    });

    it('undefined mimeType', async () => {
      fse.__setPaths(['whatever.extname']);
      const req = await request(`http://127.0.0.1:${server.port}/whatever.extname`);
      expect(req.statusCode).toBe(200);
      expect(req.headers['content-type']).toBe('text/plain');
      fse.__reset();
    });
  });

  describe('basename set', () => {
    let server;
    beforeAll(async () => {
      server = (await createServer({
        port,
        getCwd: () => path.resolve('docs'),
        getBaseurl: () => 'wikic',
      })).listen();
    });

    afterAll(() => {
      server.close();
    });

    it('should return 200', async () => {
      const req = await request(`http://127.0.0.1:${server.port}/wikic`);
      expect(req.statusCode).toBe(200);
    });

    it('should return 404', async () => {
      const { statusCode } = await request(`http://127.0.0.1:${server.port}/`);
      expect(statusCode).toBe(404);
    });
  });

  describe('dynamic baseurl', () => {
    it('works', async () => {
      let baseurl = 'b1';
      // jest.resetModules();
      const server = (await createServer({
        port,
        getCwd: () => path.resolve('docs'),
        getBaseurl: () => baseurl,
      })).listen();

      expect((await request(`http://127.0.0.1:${server.port}/b1`)).statusCode).toBe(200);
      baseurl = 'b2';
      expect((await request(`http://127.0.0.1:${server.port}/b1`)).statusCode).toBe(404);
      expect((await request(`http://127.0.0.1:${server.port}/b2`)).statusCode).toBe(200);
      server.close();
    });
  });
});
