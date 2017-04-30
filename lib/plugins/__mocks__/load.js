module.exports = (context) => {
  Object.assign(context, {
    data: '',
  });
  return Promise.resolve(context);
};
