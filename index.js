const program = require('commander');

const productsHandler = require('./actions/products');
const menu = require('./actions/menu').menu;

program.version('0.0.1');

program.command('browse-products')
    .description('Browse live products')
    .option('-f -filter <value>', 'Filter by product name')
    .action(productsHandler.handleProducts);

program.command('show-menu', '', {isDefault: true, noHelp: true})
    .description('Show all commands in an interactive manner')
    .action(menu);

program.on('command:*', function() {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);


if (process.argv.length < 3) {
  menu().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

