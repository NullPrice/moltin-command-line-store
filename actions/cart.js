const config = require('.././config');
const inquirer = require('inquirer');
const uuid = require('uuid/v4');
const MoltinGateway = require('@moltin/sdk').gateway;
const cartFormatter = require('../formatter/cart');
const Moltin = MoltinGateway({
  client_id: config.client_id,
});

if (typeof localStorage === 'undefined' || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./localStorage/cart');
}

const handleCartQuestions = [
  {
    type: 'confirm',
    name: 'addToCart',
    message: 'Would you like to add this product to a cart?',
  },
  {
    type: 'input',
    name: 'productQuantity',
    message: 'How much of this product would you like to add?',
    validate: function isNumeric(num) {
      return !isNaN(num);
    },
  },
];

const cartMenuChoices = [
  {
    name: 'View Cart',
    value: 'view-cart',
  },
  {
    name: 'Clear Cart',
    value: 'clear-cart',
  },
  new inquirer.Separator(),
  {
    name: 'Menu',
    value: 'menu',
  },
];

const cartMenuQuestions = [
  {
    type: 'rawlist',
    name: 'menu',
    message: 'Select an action',
    paginated: true,
    choices: cartMenuChoices,
  },
];

/**
 * Handles the cart prompt if a user selects a product
 * @param {object} product - Product object
 */
async function handleCartPrompt(product) {
  if (!product) {
    return;
  }
  const answers = await inquirer.prompt(handleCartQuestions);
  if (answers.addToCart) {
    if (!localStorage.getItem('referenceId')) {
      localStorage.setItem('referenceId', uuid());
    }
    const cartResponse = await Moltin.Cart(localStorage.getItem('referenceId'))
        .AddProduct(product.id, answers.productQuantity);
    console.log(cartResponse);
  }
}

/**
 *
 */
async function viewCart() {
  if (!localStorage.getItem('referenceId')) {
    console.log('No cart has been initilized');
    return;
  }
  console.log(await cartFormatter(await Moltin.Cart(localStorage.getItem('referenceId')).Get()));
}

/**
 */
async function cartMenu() {
  let backFlag = false;
  while (!backFlag) {
    // We don't want to exit the menu until explicit user input
    const answers = await inquirer.prompt(cartMenuQuestions);
    switch (answers.menu) {
      case 'view-cart':
        await viewCart();
        break;
      case 'clear-cart':
        break;
      case 'menu':
        backFlag = true;
        break;
      default:
        console.log('Invalid');
    }
  }
}

module.exports = {handleCartPrompt, cartMenu};
