import { join } from 'path'
import { readdirSync, removeSync, copySync } from 'fs-extra'
import fsDeepEqual from './_test_res_/fsDeepEqual'
import Wikic from '..'

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
