module.exports = function capitalize(word) {
  if (word[0] && word.toUpperCase) {
    return word[0].toUpperCase() + word.slice(1)
  }
  return word
}
