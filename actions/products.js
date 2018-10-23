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
  const answers = await inquirer.prompt(questions);
  output.push(answers);
  if (answers.productConfirmed) {
    // TODO: Select quantity
    // TODO: Handle not in stock
    const product = answers.product;
    console.log(`Name: ${product.name}
Description: ${product.description}
Price: ${product.meta.display_price.with_tax.formatted
  || product.meta.display_price.without_tax.formatted}
`);
    return product;
  } else {
    handleProducts();
  }
}

module.exports = {
  handleProducts,
};
