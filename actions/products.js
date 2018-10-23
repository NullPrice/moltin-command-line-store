const inquirer = require('inquirer');
const config = require('.././config');
const MoltinGateway = require('@moltin/sdk').gateway;
const Moltin = MoltinGateway({
  client_id: config.client_id,
});
const cart = require('./cart');

const viewProductsQuestions = [
  {
    type: 'rawlist',
    name: 'product',
    message: 'Which product do you want to view more info for?',
    paginated: true,
    choices: async function() {
      const products = await Moltin.Products.All();
      const productsChoice = [];
      products.data.forEach((element) => {
        productsChoice.push({
          name: element.name,
          short: JSON.stringify(element.name),
          value: element,
        });
      });
      return productsChoice;
    },
  },
];

const cartPromptQuestion = [
  {
    type: 'confirm',
    name: 'addToCart',
    message: 'Would you like to add this product to a cart?',
  },
];

/**
 * Function to handle product browse commands
 */
async function viewProducts() {
  const answers = await inquirer.prompt(viewProductsQuestions);
  // TODO: Select quantity
  // TODO: Handle not in stock
  const product = answers.product;
  console.log(`Name: ${product.name}
Description: ${product.description}
Price: ${product.meta.display_price.with_tax.formatted
    || product.meta.display_price.without_tax.formatted}
`);
  const cartAnswer = await inquirer.prompt(cartPromptQuestion);
  if (cartAnswer.addToCart) {
    // Should I have another layer that handles the selected product instead of calling cart directly.
    await cart.addToCart(product);
  }
}

const menuChoices = [
  {
    name: 'View Products',
    value: 'view-products',
  },
  new inquirer.Separator(),
  {
    name: 'Menu',
    value: 'menu',
  },
];

const menuQuestions = [
  {
    type: 'rawlist',
    name: 'menu',
    message: 'Select an action',
    paginated: true,
    choices: menuChoices,
  },
];

/**
 */
async function showMenu() {
  let backFlag = false;
  while (!backFlag) {
    // We don't want to exit the menu until explicit user input
    const answers = await inquirer.prompt(menuQuestions);
    switch (answers.menu) {
      case 'view-products':
        await viewProducts();
        break;
      case 'menu':
        backFlag = true;
        break;
      default:
        console.log('Invalid');
    }
  }
}

module.exports = {
  viewProducts, showMenu,
};
