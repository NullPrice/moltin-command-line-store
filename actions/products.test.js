const Products = require('./products');
const inquirer = require('inquirer');
jest.mock('inquirer');
const Cart = require('./cart');
jest.mock('./cart');
const formatter = require('../formatter/formatter');
jest.mock('../formatter/formatter');
const testData = require('../helpers/test-data');
const mockedCart = new Cart({});
const mockedMoltin = {
  Products: {All: jest.fn(), Filter: jest.fn().mockReturnValue({With: jest.fn().mockReturnValue({All: jest.fn().mockReturnValue({})})})},
};

describe('viewProducts', async () => {
  it('can add pass a product to a cart successfully', async () => {
    inquirer.prompt
        .mockReturnValueOnce({menu: 'view-products'})
        .mockReturnValueOnce(testData.productAllResponseFormatted)
        .mockReturnValueOnce({addToCart: true})
        .mockReturnValueOnce({menu: 'menu'});

    mockedMoltin.Products.All.mockReturnValue(testData.productsAllResponse);

    const opts = {
      inquirer: inquirer,
      moltin: mockedMoltin,
      formatter: formatter,
      cart: mockedCart,
    };
    const products = new Products(opts);
    await products.showMenu();
    expect(mockedCart.addToCart.mock.calls.length).toBe(1);
    expect(mockedCart.addToCart.mock.calls[0][0]).toBe(testData.productAllResponseFormatted.product);
  });

  it('can handle no products returned from moltin', async () => {
    inquirer.prompt
        .mockReturnValueOnce({menu: 'view-products'})
        .mockReturnValueOnce({})
        .mockReturnValueOnce({addToCart: false})
        .mockReturnValueOnce({menu: 'menu'});
    mockedMoltin.Products.All.mockReturnValueOnce({});

    const opts = {
      inquirer: inquirer,
      moltin: mockedMoltin,
      formatter: formatter,
      cart: mockedCart,
    };
    const products = new Products(opts);
    await products.showMenu();
    expect(inquirer.prompt.mock.calls.length).toBe(4);
    expect(mockedCart.addToCart.mock.calls.length).toBe(0);
  });
});

describe('searchProducts', async () => {
  it('can filter and pass a products object to viewProducts', async () => {
    // No need to mock all inquirer prompts for viewProducts since we are mocking view products
    inquirer.prompt
        .mockReturnValueOnce({menu: 'search-products'})
        .mockReturnValueOnce({searchTerm: 'Some search'})
        .mockReturnValueOnce({menu: 'menu'});
    mockedMoltin.Products.All.mockReturnValueOnce({});

    // Some search term returns this
    mockedMoltin.Products.Filter().With().All = jest.fn().mockReturnValue(testData.productsAllResponse);

    const opts = {
      inquirer: inquirer,
      moltin: mockedMoltin,
      formatter: formatter,
      cart: mockedCart,
    };
    jest.unmock('./products');
    const products = new Products(opts);
    products.viewProducts = jest.fn();
    await products.showMenu();
    expect(products.viewProducts.mock.calls.length).toBe(1);
    expect(products.viewProducts.mock.calls[0][0]).toBe(testData.productsAllResponse);
  });
});

