const Menu = require('./menu');
const inquirer = require('inquirer');
jest.mock('inquirer');
const Products = require('./products');
jest.mock('./products');
const Cart = require('./cart');
jest.mock('./cart');

test('Browse product menu can be used', async () => {
  inquirer.prompt
      .mockReturnValueOnce({menu: 'browse-products'})
      .mockReturnValueOnce({menu: 'exit'});

  const mockedProducts = new Products({});
  const mockedCart = new Cart({});

  const opts = {
    inquirer: inquirer,
    products: mockedProducts,
    cart: mockedCart,
  };
  const menu = new Menu(opts);
  await menu.showMenu();
  expect(mockedProducts.showMenu.mock.calls.length).toBe(1);
});

test('Manage cart menu can be used', async () => {
  inquirer.prompt
      .mockReturnValueOnce({menu: 'manage-cart'})
      .mockReturnValueOnce({menu: 'exit'});

  const mockedProducts = new Products({});
  const mockedCart = new Cart({});

  const opts = {
    inquirer: inquirer,
    products: mockedProducts,
    cart: mockedCart,
  };
  const menu = new Menu(opts);
  await menu.showMenu();
  expect(mockedCart.showMenu.mock.calls.length).toBe(1);
});

