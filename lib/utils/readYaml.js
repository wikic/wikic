const yaml = require('js-yaml');
const fs = require('fs');

module.exports = (pathname) => {
  const data = fs.readFileSync(pathname, 'utf8');
  const config = yaml.safeLoad(data);
  return config;
};
