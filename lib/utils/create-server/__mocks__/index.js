const createServer = jest.fn(() => {
  const server = {
    listen: jest.fn().mockReturnThis(),
    close: jest.fn().mockReturnThis(),
  }
  return Promise.resolve(server)
})

module.exports = createServer
