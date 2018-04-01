module.exports = function deleteProps(obj, keys) {
  keys.forEach(key => {
    delete obj[key]
  })
}
