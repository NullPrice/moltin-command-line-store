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
    await this.createCart();
    try {
      await this.moltin
          .Cart(await this.getCart().referenceId)
          .AddProduct(product.id, answers.productQuantity);
      console.log('Product added to cart!');
    } catch (err) {
      throw new Error(`Failed to add product to cart: ${err.message}`);
    }
  }

  /**
   * Returns cart localStorage object
   * @return {object} Cart object containing referenceId
   */
  async getCart() {
    try {
      const cart = JSON.parse(this.localStorage.getItem('cart'));
      return cart;
    } catch (err) {
      // Gracefully handle
      return false;
    }
  }

  /**
   * Creates a new cart reference
   */
  async createCart() {
    if (!await this.getCart()) {
      try {
        this.localStorage.setItem('cart',
            JSON.stringify({referenceId: this.uuid()}));
      } catch (err) {
        throw new Error(`Failed to create cart: ${err.message}`);
      }
    }
  }

  /**
   * Deletes reference essentially delete the cart
   */
  async deleteCart() {
    try {
      await this.moltin.Cart(this.getCart().referenceId).Delete();
      this.localStorage.removeItem('cart');
      console.log('Cart has been deleted!');
    } catch (err) {
      throw new Error(`Failed to delete cart: ${err.message}`);
    }
  }


  /**
 * Displays the current cart
 */
  async viewCart() {
    if (!await this.getCart()) {
      console.log('No cart found');
      return;
    }
    const cart = await this.moltin
        .Cart(await this.getCart().referenceId).Items();
    console.table(this.formatter.formatCartItems(cart));
    console.table([{
      cartTotal: cart.meta.display_price.with_tax.formatted,
    }]);
  }

  /**
   * Handles prompt questions and enables user to create an order from a cart
   */
  async checkoutCart() {
    if (!await this.getCart()) {
      console.log('No cart to checkout!');
      return;
    }

    // TODO: this should be part of a customer actions object
    if (!this.localStorage.getItem('customerDetails')) {
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
    try {
      const order = await this.moltin.Cart(this.getCart.referenceId)
          .Checkout(customerDetails.customer, customerDetails.billing);
      console.log(`Order successfully created. Your order id is: ${order.data.id}`);
      this.deleteCart();
    } catch (err) {
      throw new Error(`Order failed to be created: ${err.message}`);
    }
  }

  /**
   * Renders menu list for carts
   */
  async showMenu() {
    const cartMenuChoices = [
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
        name: 'Go back to main menu',
        value: 'menu',
      },
    ];

    const cartMenuQuestions = [
      {
        type: 'rawlist',
        name: 'menu',
        message: 'Select an action',
        paginated: true,
        choices: cartMenuChoices,
      },
    ];
    let backFlag = false;
    while (!backFlag) {
      // We don't want to exit the menu until explicit user input
      const answers = await this.inquirer.prompt(cartMenuQuestions);
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
