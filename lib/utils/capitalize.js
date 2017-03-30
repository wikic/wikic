module.exports = function capitalize(word) {
  if (typeof word !== 'string') throw Error('word must be string')
  if (word[0] && word.toUpperCase) {
    return word[0].toUpperCase() + word.slice(1)
  }
  return word
}
