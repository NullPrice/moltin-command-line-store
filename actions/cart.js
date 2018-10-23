const config = require('.././config');
const inquirer = require('inquirer');
const uuid = require('uuid/v4');
const MoltinGateway = require('@moltin/sdk').gateway;
const Moltin = MoltinGateway({
  client_id: config.client_id,
});

if (typeof localStorage === 'undefined' || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./localStorage/cart');
}

const questions = [
  {
    type: 'confirm',
    name: 'addToCart',
    message: 'Would you like to add this product to a cart?',
  },
];

/**
 * Handles the cart prompt if a user selects a product
 * @param {object} product - Product object
 */
async function handleCartPrompt(product) {
  const answers = await inquirer.prompt(questions);
  if (answers.addToCart) {
    if (!localStorage.getItem('referenceId')) {
      localStorage.setItem('referenceId', uuid());
    }

    const cartResponse = await Moltin.Cart(localStorage.getItem('referenceId'))
        .AddProduct(product.id, 1);
    console.log(cartResponse);
  }
}

module.exports = {handleCartPrompt};
