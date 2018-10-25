/**
 * Cart object - Handles menu prompts and moltin calls
 */
class Cart {
  /**
   *
   * @param {object} opts - Dependencies
   */
  constructor(opts) {
    this.inquirer = opts.inquirer;
    this.uuid = opts.uuid;
    this.moltin = opts.moltin;
    this.localStorage = opts.localStorage;
    this.formatter = opts.formatter;

    this.cartMenuChoices = [
      {
        name: 'View Cart',
        value: 'view-cart',
      },
      {
        name: 'Checkout Cart',
        value: 'checkout-cart',
      },
      {
        name: 'Delete Cart',
        value: 'delete-cart',
      },
      new this.inquirer.Separator(),
      {
        name: 'Menu',
        value: 'menu',
      },
    ];

    this.cartMenuQuestions = [
      {
        type: 'rawlist',
        name: 'menu',
        message: 'Select an action',
        paginated: true,
        choices: this.cartMenuChoices,
      },
    ];
  }

  /**
   * Handles the cart prompt if a user selects a product
   * @param {object} product - Product object
   */
  async addToCart(product) {
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

    const answers = await this.inquirer.prompt(questions);
    if (!this.getCart()) {
      this.createCart();
    }

    const cartResponse = await this.moltin
        .Cart(this.getCart().referenceId)
        .AddProduct(product.id, answers.productQuantity);
    console.log(cartResponse);
  }

  /**
   * Returns cart localStorage object
   * @return {object} Cart object containing referenceId
   */
  getCart() {
    try {
      const cart = JSON.parse(this.localStorage.getItem('cart'));
      return cart;
    } catch (err) {
      return;
    }
  }

  /**
   * Creates a new cart reference
   */
  createCart() {
    console.log('Have we attempted to create a cart...');
    this.localStorage.setItem('cart',
        JSON.stringify({referenceId: this.uuid()}));
  }

  /**
   * Deletes reference essentially delete the cart
   */
  deleteCart() {
    try {
      this.moltin.Cart(this.getCart().referenceId).Delete();
      this.localStorage.removeItem('cart');
    } catch (err) {
      console.error(`Failed to delete cart: ${err}`);
    }
  }


  /**
 * Displays the current cart
 */
  async viewCart() {
    if (!this.getCart()) {
      console.log('No cart found');
      return;
    }
    const cart = await this.moltin
        .Cart(this.getCart().referenceId).Items();
    console.table(this.formatter.formatCart(cart));
    console.table([{
      cartTotal: cart.meta.display_price.with_tax.formatted,
    }]);
  }

  /**
   *
   */
  async clearCartItems() {
    console.log('TODO');
  }

  /**
   * Handles prompt questions and enables user to create an order from a cart
   */
  async checkoutCart() {
    // TODO: New customer?
    if (!this.getCart()) {
      console.log('No cart to checkout!');
      return;
    }

    // TODO this should be part of a customer file / object
    // TODO infact all of these 'actions' should instead be objects
    if (!this.localStorage.getItem('customerDetails')) {
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
      const customer = await this.inquirer.prompt(prompter(customerQuestions));
      customer.name = `${customer.first_name} ${customer.last_name}`;
      const billing = await this.inquirer.prompt(prompter(billingQuestions));
      billing.first_name = customer.first_name;
      billing.last_name = customer.last_name;
      this.localStorage.setItem('customerDetails', JSON.stringify({
        customer: customer,
        billing: billing,
      }));
    }
    // Make the order
    const customerDetails = JSON.parse(this.localStorage.getItem('customerDetails'));
    console.log(customerDetails);
    this.moltin.Cart(this.getCart.referenceId)
        .Checkout(customerDetails.customer, customerDetails.billing)
        .then((order) => {
          console.log(JSON.stringify(order));
          this.deleteCart();
        }).catch((err) => {
          console.error(err);
        });
  }

  /**
   * Renders menu list for carts
   */
  async showMenu() {
    let backFlag = false;
    while (!backFlag) {
      // We don't want to exit the menu until explicit user input
      const answers = await this.inquirer.prompt(this.cartMenuQuestions);
      switch (answers.menu) {
        case 'view-cart':
          await this.viewCart();
          break;
        case 'checkout-cart':
          await this.checkoutCart();
          break;
        case 'delete-cart':
          await this.deleteCart();
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


module.exports = Cart;
