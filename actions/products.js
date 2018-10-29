
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
   * @param {Objects} products - Products passed in via search functionality
   */
  async viewProducts(products) {
    // Show products information
    const allProducts = products || await this.moltin.Products.All();
    console.table(this.formatter.formatProducts(allProducts));

    // Build inquirer product select prompt
    const backOption = 'back-option';
    const viewProductsQuestions = [
      {
        type: 'rawlist',
        name: 'product',
        message: 'Select a product to add to cart.',
        paginated: true,
        choices: async () => {
          const productsChoice = [];
          allProducts.data.forEach((product) => {
            if (product.meta.stock.level > 0) {
              {
                productsChoice.push({
                  name: product.name,
                  short: JSON.stringify(product.name),
                  value: product,
                });
              }
            }
          });
          productsChoice.push(new this.inquirer.Separator(),
              {
                name: 'Back',
                value: backOption,
              });
          return productsChoice;
        },
      },
    ];
    const answers = await this.inquirer.prompt(viewProductsQuestions);
    const product = answers.product;
    if (product === backOption) {
      return;
    }
    const cartPromptQuestion = [
      {
        type: 'confirm',
        name: 'addToCart',
        message: 'Are you sure?',
      },
    ];

    const cartAnswer = await this.inquirer.prompt(cartPromptQuestion);
    if (cartAnswer.addToCart) {
      await this.cart.addToCart(product);
    }
  }

  /**
  * Search products
  */
  async searchProducts() {
    // TODO: Need to expand this further
    const answer = await this.inquirer.prompt({
      type: 'input',
      name: 'searchTerm',
      message: `Please input a search term to filter products via name`,
    });
    await this.viewProducts(await this.moltin.Products.Filter({
      like: {
        name: `${answer.searchTerm}`,
      },
    }).With(['name']).All());
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
      {
        name: 'Search Products',
        value: 'search-products',
      },
      new this.inquirer.Separator(),
      {
        name: 'Go back to main menu',
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
        case 'search-products':
          await this.searchProducts();
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
