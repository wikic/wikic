const findDocs = require('../findDocs');

test('find it', () => {
  expect(
    findDocs(
      {
        a: { b: { c: {} } },
      },
      ['a', 'b', 'c']
    )
  ).toEqual({});
  expect(
    findDocs(
      {
        a: { b: { c: {} } },
      },
      ['a']
    )
  ).toEqual({ b: { c: {} } });
});
