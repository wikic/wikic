const { join } = require('path')
const { readdirSync, removeSync, copySync } = require('fs-extra')
const fsDeepEqual = require('./_test_res_/fsDeepEqual')
const Wikic = require('..')

const fixturesDir = join(__dirname, './_test_res_/fixtures')
const expectedDir = join(__dirname, './_test_res_/expected')

const { GEN_EXPECTED } = process.env

readdirSync(fixturesDir).forEach(dir => {
  test(`actual ${dir}`, async () => {
    const wikic = new Wikic(join(fixturesDir, dir))
    await wikic.clean()
    await wikic.build()
    const fixture = wikic.publicPath
    const expected = join(expectedDir, dir)
    if (GEN_EXPECTED) {
      removeSync(expected)
      copySync(fixture, expected)
    }
    expect(fsDeepEqual(fixture, expected)).toBe(true)
  })
})
