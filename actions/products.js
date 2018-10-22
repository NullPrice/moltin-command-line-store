const inquirer = require('inquirer');
const config = require('.././config');
const MoltinGateway = require('@moltin/sdk').gateway;
const Moltin = MoltinGateway({
  client_id: config.client_id,
});


const output = [];

const questions = [
  {
    type: 'rawlist',
    name: 'product',
    message: 'Which product do you want to view more info for?',
    choices: async function() {
      const products = await Moltin.Products.All();
      const productsChoice = [];
      products.data.forEach((element) => {
        productsChoice.push({
          name: element.name,
          short: element.name,
          value: element,
        });
      });
      return productsChoice;
    },
  },
  {
    type: 'confirm',
    name: 'productConfirmed',
    message: 'Are you sure?',
    default: true,
  },
];


/**
 * Function to handle product browse commands
 */
async function handleProducts() {
  inquirer.prompt(questions).then((answers) => {
    output.push(answers);
    if (answers.productConfirmed) {
      // Parse out 'useful' information and begin another prompt asking if you would like to add cart
      // TODO: Local storage cart?
      // TODO: Select quantity
      console.log(answers);
    } else {
    //   console.log('Your favorite TV Shows:', output.join(', '));
      handleProducts();
    }
  });
}

module.exports = {
  handleProducts,
};
