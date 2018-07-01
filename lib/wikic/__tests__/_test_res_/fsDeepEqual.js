const { join } = require('path')
const fs = require('fs')

function arrayEqual(a, b) {
  return a.length === b.length && b.every(e => a.indexOf(e) >= 0)
}

module.exports = function fsDeepEqual(a, b) {
  const aStat = fs.statSync(a)
  const bStat = fs.statSync(b)
  if (aStat.size !== bStat.size) {
    return false
  }
  if (aStat.isDirectory() && bStat.isDirectory()) {
    const aKids = fs.readdirSync(a)
    const bKids = fs.readdirSync(b)
    if (!arrayEqual(aKids, bKids)) return false
    return aKids.every(k => fsDeepEqual(join(a, k), join(b, k)))
  } else if (aStat.isFile() && bStat.isFile()) {
    return fs.readFileSync(a).equals(fs.readFileSync(b))
  }
  return false
}
