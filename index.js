const program = require('commander');
const awilix = require('awilix');
const products = require('./actions/products');
const Menu = require('./actions/menu');

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

container.register({
  menu: awilix.asClass(Menu),
  inquirer: awilix.asValue(require('inquirer')),
  cart: awilix.asValue(require('./actions/cart')),
});

program.version('0.0.1');

program.command('browse-products')
    .description('Browse live products')
    .option('-f -filter <value>', 'Filter by product name')
    .action(products.showMenu);

program.command('show-menu', '', {isDefault: true, noHelp: true})
    .description('Show all commands in an interactive manner')
    .action(container.resolve('menu').showMenu);

program.on('command:*', function() {
  console.error('Invalid command: %s\nSee --help for a list of available commands.',
      program.args.join(' '));
  process.exit(1);
});
program.parse(process.argv);


if (process.argv.length < 3) {
  container.resolve('menu').showMenu().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

