const renderer = {}
renderer.configure = jest.fn()
renderer.render = jest.fn((layout, context) => context.content)
renderer.env = {}
renderer.env.addGlobal = jest.fn()
renderer.env.addFilter = jest.fn()

module.exports = renderer
