/**
* Format helper to return a console.table friendly array of product objects
* @param {object} products - Array of product objects
* @return {array} - Array of console.table friendly product objects
*/
function formatProducts(products) {
  const formattedProducts = [];
  products.data.forEach((product) => {
    formattedProducts.push({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.meta.display_price.with_tax.formatted,
      status: product.meta.stock.availability,
    });
  });
  return formattedProducts;
};

/**
 * Format helper to return a console.table friendly array of cart items
 * @param {object} cart - Cart items response object
 * @return {array} - Table friendly array for showing cart details
 */
function formatCartItems(cart) {
  const formattedCart = [];
  cart.data.forEach((product) => {
    formattedCart.push({
      id: product.id,
      name: product.name,
      description: product.description,
      quanitity: product.quantity,
      unitPrice: product.meta.display_price.with_tax.unit.formatted,
      totalPrice: product.meta.display_price.with_tax.value.formatted,
    });
  });
  return formattedCart;
};

module.exports = {
  formatProducts,
  formatCartItems,
};
