
/**
 * Products
 */
class Products {
  /**
   *
   * @param {*} opts
   */
  constructor(opts) {
    this.moltin = opts.moltin;
    this.cart = opts.cart;
    this.inquirer = opts.inquirer;
  }

  /**
   * Function to handle product browse commands
   */
  async viewProducts() {
    const viewProductsQuestions = [
      {
        type: 'rawlist',
        name: 'product',
        message: 'Which product do you want to view more info for?',
        paginated: true,
        choices: async () => {
          const products = await this.moltin.Products.All();
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

    const answers = await this.inquirer.prompt(viewProductsQuestions);
    // TODO: Select quantity
    // TODO: Handle not in stock
    const product = answers.product;
    console.log(`Name: ${product.name}\
      Description: ${product.description}\
      Price: ${product.meta.display_price.with_tax.formatted
      || product.meta.display_price.without_tax.formatted}`);

    const cartAnswer = await this.inquirer.prompt(cartPromptQuestion);
    if (cartAnswer.addToCart) {
      // Should I have another layer that handles the selected product instead of calling cart directly.
      await this.cart.addToCart(product);
    }
  }

  /**
   */
  async showMenu() {
    const menuChoices = [
      {
        name: 'View Products',
        value: 'view-products',
      },
      new this.inquirer.Separator(),
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

    let backFlag = false;
    while (!backFlag) {
      // We don't want to exit the menu until explicit user input
      const answers = await this.inquirer.prompt(menuQuestions);
      switch (answers.menu) {
        case 'view-products':
          await this.viewProducts();
          break;
        case 'menu':
          backFlag = true;
          break;
        default:
          console.log('Invalid');
      }
    }
  }
}


module.exports = Products;
