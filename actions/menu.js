const inquirer = require('inquirer');
const products = require('./products');
const cart = require('./cart');

const choices = [
  {
    name: 'Browse Products',
    value: 'browse-products',
  },
  {
    name: 'View Cart',
    value: 'view-cart',
  },
  new inquirer.Separator(),
  {
    name: 'Exit',
    value: 'exit',
  },
];

const questions = [
  {
    type: 'rawlist',
    name: 'menu',
    message: 'Select an action',
    paginated: true,
    choices: choices,
  },
];


/**
 * Function to handle rendering main menu
 */
async function menu() {
  let exitFlag = false;
  while (!exitFlag) {
    // We don't want to exit the menu until explicit user input
    const answers = await inquirer.prompt(questions);
    switch (answers.menu) {
      case 'browse-products':
        await cart.handleCartPrompt(await products.handleProducts());
        break;
      case 'view-cart':
        break;
      case 'exit':
        console.log('Exiting!');
        exitFlag = true;
        break;
      default:
        console.log('Invalid');
    }
    console.log(JSON.stringify(answers));
  }
}

module.exports = {
  menu,
};
