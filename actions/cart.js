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
  localStorage = new LocalStorage('./localStorage/moltin');
}

/**
 * Handles the cart prompt if a user selects a product
 * @param {object} product - Product object
 */
async function addToCart(product) {
  const questions = [
    {
      type: 'input',
      name: 'productQuantity',
      message: 'How much of this product would you like to add?',
      validate: function isNumeric(num) {
        return !isNaN(num);
      },
    },
  ];
  if (!product) {
    return;
  }
  const answers = await inquirer.prompt(questions);
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify({referenceId: uuid()}));
  }
  const cartResponse = await Moltin.Cart(JSON.parse(localStorage.getItem('cart')).referenceId)
      .AddProduct(product.id, answers.productQuantity);
  console.log(cartResponse);
  // TODO: Show cart total
}

/**
 * Displays the current cart
 */
async function viewCart() {
  if (!localStorage.getItem('cart')) {
    console.log('No cart has been initilized -- Add a product to a cart through the product menu!');
    return;
  }
  console.log(await cartFormatter(await Moltin.Cart(JSON.parse(localStorage.getItem('cart')).referenceId).Get()));
}

/**
 *
 */
async function checkoutCart() {
  // TODO: New customer?
  if (!localStorage.getItem('cart')) {
    console.log('No cart to checkout!');
    return;
  }

  // TODO this should be part of a customer file / object
  // TODO infact all of these 'actions' should instead be objects
  if (!localStorage.getItem('customerDetails')) {
    // We haven't got a customer, let's create one and set it in localStorage
    // TODO: Multiple customer support? (Probably not likely needed from a command line store)
    const prompter = (questions) => {
      const output = [];
      questions.forEach((question) => {
        if (typeof question === 'object') {
          output.push(Object.assign({
            type: 'input',
            name: question.text.split(' ').join('_'),
            message: `Please input your ${question.text}`,
            validate: (input) => {
              return input !== '';
            },
          }, question));
        } else {
          output.push({
            type: 'input',
            name: question.split(' ').join('_'),
            message: `Please input your ${question}`,
            validate: (input) => {
              return input !== '';
            },
          });
        }
      });
      return output;
    };
    const customerQuestions = ['email', 'first name', 'last name'];
    const billingQuestions = [{text: 'address line 1', name: 'line_1'},
      {text: 'address line 2', name: 'line_2'},
      'city', 'postcode', 'county', 'country'];
    const customer = await inquirer.prompt(prompter(customerQuestions));
    customer.name = `${customer.first_name} ${customer.last_name}`;
    const billing = await inquirer.prompt(prompter(billingQuestions));
    billing.first_name = customer.first_name;
    billing.last_name = customer.last_name;
    localStorage.setItem('customerDetails', JSON.stringify({customer: customer,
      billing: billing}));
  }
  // Make the order
  const customerDetails = JSON.parse(localStorage.getItem('customerDetails'));
  console.log(customerDetails);
  Moltin.Cart(JSON.parse(localStorage.getItem('cart')).referenceId)
      .Checkout(customerDetails.customer, customerDetails.billing)
      .then((order) => {
        console.log(JSON.stringify(order));
      }).catch((err) => {
        console.error(err);
      });

  // Clear cart?
}

const cartMenuChoices = [
  {
    name: 'View Cart',
    value: 'view-cart',
  },
  {
    name: 'Checkout Cart',
    value: 'checkout-cart',
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
 * Renders menu list for carts
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
      case 'checkout-cart':
        await checkoutCart();
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
