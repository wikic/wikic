const http = require('http');

const request = url =>
  new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res);
    });
  });

module.exports = request;
