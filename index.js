const Commander = require('commander');

const productsHandler = require('./actions/products');

Commander.command('browse-products')
    .description('Browse live products')
    .option('-f -filter <value>', 'Filter by product name')
    .action(productsHandler.handleProducts);

Commander.parse(process.argv);
