module.exports = (wikic) => {
  if (!wikic.config.suites) return;
  wikic.config.suites.forEach(wikic.registerSuite.bind(wikic));
};
