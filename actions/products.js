
/**
 * Products
 */
class Products {
  /**
   *
   * @param {Object} opts - Injected dependencies
   */
  constructor(opts) {
    this.moltin = opts.moltin;
    this.cart = opts.cart;
    this.inquirer = opts.inquirer;
    this.formatter = opts.formatter;
  }

  /**
   * Renders products
   */
  async viewProducts() {
    const allProducts = await this.moltin.Products.All();
    console.table(this.formatter.formatProducts(allProducts));
    const viewProductsQuestions = [
      {
        type: 'rawlist',
        name: 'product',
        message: 'Which product do you want to view more info for?',
        paginated: true,
        choices: async () => {
          const productsChoice = [];
          allProducts.data.forEach((product) => {
            if (product.meta.stock.level > 0) {
              {productsChoice.push({
                name: product.name,
                short: JSON.stringify(product.name),
                value: product,
              });}
            }
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
    const product = answers.product;
    console.log(`Name: ${product.name}\
      Description: ${product.description}\
      Price: ${product.meta.display_price.with_tax.formatted
      || product.meta.display_price.without_tax.formatted}`);

    const cartAnswer = await this.inquirer.prompt(cartPromptQuestion);
    if (cartAnswer.addToCart) {
      await this.cart.addToCart(product);
    }
  }

  /**
   * Renders product menu
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
