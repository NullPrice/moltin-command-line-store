
/**
 * Menu
 */
class Menu {
  /**
   *
   * @param {*} opts - Injected dependencies
   */
  constructor(opts) {
    this.inquirer = opts.inquirer;
    this.products = opts.products;
    this.cart = opts.cart;

    this.choices = [
      {
        name: 'Browse Products',
        value: 'browse-products',
      },
      {
        name: 'Manage Cart',
        value: 'manage-cart',
      },
      new this.inquirer.Separator(),
      {
        name: 'Exit',
        value: 'exit',
      },
    ];

    this.questions = [
      {
        type: 'rawlist',
        name: 'menu',
        message: 'Select an action',
        paginated: true,
        choices: this.choices,
      },
    ];
  }


  /**
   * Renders the main menu for the storefront
   */
  async showMenu() {
    let exitFlag = false;
    while (!exitFlag) {
      // We don't want to exit the menu until explicit user input
      const answers = await this.inquirer.prompt(this.questions);
      switch (answers.menu) {
        case 'browse-products':
          await this.products.showMenu();
          break;
        case 'manage-cart':
          await this.cart.showMenu();
          break;
        case 'exit':
          console.log('Exiting!');
          exitFlag = true;
          break;
        default:
          console.log('Invalid');
      }
    }
  }
}


module.exports = Menu;
