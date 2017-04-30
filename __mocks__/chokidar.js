const EventEmitter = require('events');
/* eslint-disable no-underscore-dangle */
const emiter = new EventEmitter();
const chokidar = jest.genMockFromModule('chokidar');
chokidar.watch = jest.fn(() => emiter);
chokidar.__emiter = emiter;

module.exports = chokidar;
