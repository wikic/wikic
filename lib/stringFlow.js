module.exports = (string = '', funcs = []) => funcs.reduce((content, func) => func(content), string)

  // .then(html => stringFlow(html, [htmlclean]))
