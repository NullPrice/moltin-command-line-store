const formatter = require('./formatter');
const each = require('jest-each');

each([[1, 1, 2], [1, 2, 3], [2, 1, 3]]).test(
    'returns the result of adding %d to %d',
    (a, b, expected) => {
      expect(a + b).toBe(expected);
    },
);

each([[1, 1, 2], [1, 2, 3], [2, 1, 3]]).test(
    'formatProducts returns expected array',
    (input, expected) => {
      expect(a + b).toBe(expected);
    },
);

test('formatProducts returns expected array', () => {
  const products = [

  ];
});

test('formatCart returns expected array', () => {

});
