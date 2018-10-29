const formatter = require('./formatter');
const testData = require('../helpers/test-data');

test('formatProducts returns expected array', () => {
  const input = testData.productsAllResponse;
  const expected = [
    {
      'id': '71e2344d-aa83-4576-b9f4-f289460b5d7f', 'name': 'Cooler Product', 'description': 'Cooler product', 'price': '$75.00', 'status': 'in-stock',
    },
    {
      'id': '84fb53b6-8ba4-4427-94aa-991f012e358c', 'name': 'Cool Product', 'description': 'A cool product', 'price': '$50.00', 'status': 'in-stock',
    },
    {
      'id': '79966130-3b9a-42af-b8a1-5dcd7e01b2cb', 'name': 'Some Product', 'description': 'Some description', 'price': '$54.99', 'status': 'out-stock',
    },
  ];
  expect(formatter.formatProducts(input)).toMatchObject(expected);
});

test('formatCart returns expected array', () => {
  const input = testData.cartItemsResponse;
  const expected = [
    {
      'id': '41eeab16-1738-43a7-a5cf-f5fc7c5762b6', 'name': 'Some Product', 'description': 'Some description', 'quanitity': 1, 'unitPrice': '$54.99', 'totalPrice': '$54.99',
    },
    {
      'id': 'e45d0f7c-42aa-4bd2-9adc-ca8788388881', 'name': 'Cooler Product', 'description': 'Cooler product', 'quanitity': 1, 'unitPrice': '$75.00', 'totalPrice': '$75.00',
    },
  ];
  expect(formatter.formatCartItems(input)).toMatchObject(expected);
});
