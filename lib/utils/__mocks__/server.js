const server = {}

server.listen = jest.fn().mockReturnThis()
server.close = jest.fn().mockReturnThis()
server.create = jest.fn().mockReturnThis()

module.exports = server
