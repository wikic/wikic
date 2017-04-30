const configure = jest.fn(() => {
  const renderer = {
    addGlobal: jest.fn(() => this),
    addFilter: jest.fn(() => this),
    render: jest.fn(() => ''),
    renderString: jest.fn(() => ''),
  };
  return renderer;
});

const renderString = jest.fn(() => '');

module.exports = { configure, renderString };
