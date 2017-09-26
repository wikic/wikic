function pad(num) {
  if (num < 10) return `0${num}`
  return num
}

module.exports = () => {
  const date = new Date()
  const hr = pad(date.getHours())
  const min = pad(date.getMinutes())
  const sec = pad(date.getSeconds())
  return `${hr}:${min}:${sec}`
}
