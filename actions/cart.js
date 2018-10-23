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

const addToCartQuestions = [
  {
    type: 'input',
    name: 'productQuantity',
    message: 'How much of this product would you like to add?',
    validate: function isNumeric(num) {
      return !isNaN(num);
    },
  },
];


/**
 * Handles the cart prompt if a user selects a product
 * @param {object} product - Product object
 */
async function addToCart(product) {
  if (!product) {
    return;
  }
  const answers = await inquirer.prompt(addToCartQuestions);
  if (!localStorage.getItem('referenceId')) {
    localStorage.setItem('referenceId', uuid());
  }
  const cartResponse = await Moltin.Cart(localStorage.getItem('referenceId'))
      .AddProduct(product.id, answers.productQuantity);
  console.log(cartResponse);
  // TODO: Show cart total
}

/**
 *
 */
async function viewCart() {
  if (!localStorage.getItem('referenceId')) {
    console.log('No cart has been initilized -- Add a product to a cart through the product menu!');
    return;
  }
  console.log(await cartFormatter(await Moltin.Cart(localStorage.getItem('referenceId')).Get()));
}

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
 */
async function showMenu() {
  let backFlag = false;
  while (!backFlag) {
    // We don't want to exit the menu until explicit user input
    const answers = await inquirer.prompt(cartMenuQuestions);
    switch (answers.menu) {
      case 'view-cart':
        await viewCart();
        break;
      case 'clear-cart':
        console.log('TODO');
        break;
      case 'menu':
        backFlag = true;
        break;
      default:
        console.log('Invalid');
    }
  }
}

module.exports = {addToCart, showMenu};
