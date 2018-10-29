const Cart = require('./cart');
const inquirer = require('inquirer');
jest.mock('inquirer');
const uuid = require('uuid/v4');
jest.mock('uuid/v4');
const formatter = require('../formatter/formatter');
jest.mock('../formatter/formatter');
const LocalStorage = require('node-localstorage').LocalStorage;
jest.mock('node-localstorage');
const testData = require('../helpers/test-data');
const mockedMoltin = {
  Cart: {Delete: jest.fn()},
};

const uuidReturn = '123e4567-e89b-12d3-a456-426655440000';
beforeEach(() => {
  uuid.mockReturnValue(uuidReturn);
});

describe('createCart', async () => {
  it('creates cart object', async () => {
    mockedLocalStorage = new LocalStorage('/test');
    expectedCall = JSON.stringify({
      referenceId: uuidReturn,
    });
    const opts = {
      inquirer: inquirer,
      moltin: mockedMoltin,
      formatter: formatter,
      uuid: uuid,
      localStorage: mockedLocalStorage,
    };
    const cart = new Cart(opts);
    await cart.createCart();

    expect(mockedLocalStorage.setItem.mock.calls.length).toBe(1);
    expect(mockedLocalStorage.setItem.mock.calls[0][0]).toBe('cart');
    expect(mockedLocalStorage.setItem.mock.calls[0][1]).toBe(expectedCall);
  });

  it('gracefully handles itself if cart already created', async () => {
    mockedLocalStorage = new LocalStorage('/test');
    mockedLocalStorage.getItem.mockReturnValue(JSON.stringify({
      referenceId: uuidReturn,
    }));
    const opts = {
      inquirer: inquirer,
      moltin: mockedMoltin,
      formatter: formatter,
      uuid: uuid,
      localStorage: mockedLocalStorage,
    };
    const cart = new Cart(opts);
    await cart.createCart();

    expect(mockedLocalStorage.setItem.mock.calls.length).toBe(0);
  });

  it('throws when a fatal error is encountered', async () => {
    LocalStorage.mockImplementation(() => {
      return {
        setItem: () => {
          throw new Error('Write error');
        },
        getItem: jest.fn(),
      };
    });
    mockedLocalStorage = new LocalStorage('/test');
    mockedLocalStorage.getItem.mockReturnValue(undefined);

    const opts = {
      inquirer: inquirer,
      moltin: mockedMoltin,
      formatter: formatter,
      uuid: uuid,
      localStorage: mockedLocalStorage,
    };

    const cart = new Cart(opts);

    expect.assertions(1);
    try {
      await cart.createCart();
    } catch (err) {
      expect(err.message).toBe('Failed to create cart: Write error');
    }
  });
});


