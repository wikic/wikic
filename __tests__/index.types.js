const Wikic = require('../index')

jest.mock('../lib/plugins/load')
jest.mock('../lib/utils/getConfig')

test('baseurl works', () => {
  const wikic = new Wikic()
  wikic.setBaseURL('note')
  expect(wikic.baseurl).toBe('/note')
  expect(wikic.getURL('')).toBe('/note')
  expect(wikic.getURL('css/main.css')).toBe('/note/css/main.css')
  expect(wikic.getURL('/css/main.css')).toBe('/note/css/main.css')
})

describe('type of docs', () => {
  it('typeMap', () => {
    const wikic = new Wikic()
    expect(wikic.typeMap('css')).toBe('CSS')
    expect(wikic.typeMap('bash')).toBe('Bash')
  })

  it('getTypeLink', () => {
    const wikic = new Wikic()
    expect(wikic.getTypeLink(['css'])).toEqual({
      url: '/wikic/css/',
      value: 'CSS',
    })
    expect(wikic.getTypeLink(['frontend', 'css'])).toEqual({
      url: '/wikic/frontend/css/',
      value: 'CSS',
    })
    expect(wikic.getTypeLink(['xx', 'cc'])).toEqual({
      url: '/wikic/xx/cc/',
      value: 'Cc',
    })
  })

  it('getTypeLinks', () => {
    const wikic = new Wikic()
    expect(wikic.getTypeLinks(['css'])).toEqual([{
      url: '/wikic/css/',
      value: 'CSS',
    }])

    expect(wikic.getTypeLinks(['frontend', 'css'])).toEqual([
      {
        url: '/wikic/frontend/',
        value: 'FrontEnd',
      },
      {
        url: '/wikic/frontend/css/',
        value: 'CSS',
      },
    ])
  })
})
