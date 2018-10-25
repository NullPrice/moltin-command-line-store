const program = require('commander');
const awilix = require('awilix');
const LocalStorage = require('node-localstorage').LocalStorage;
const cTable = require('console.table');

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

const initLocalStorage = ({config}) => {
  return new LocalStorage(config.storagePath);
};

const initMoltinSDK = ({config}) => {
  return require('@moltin/sdk').gateway({
    client_id: config.clientId,
  });
};

container.register({
  localStorage: awilix.asFunction(initLocalStorage).singleton(),
  moltin: awilix.asFunction(initMoltinSDK),
  menu: awilix.asClass(require('./actions/menu')),
  inquirer: awilix.asValue(require('inquirer')),
  cart: awilix.asClass(require('./actions/cart')),
  products: awilix.asClass(require('./actions/products')),
  uuid: awilix.asValue(require('uuid/v4')),
  config: awilix.asValue(require('./config')),
  formatter: awilix.asValue(require('./formatter/formatter')),
});

program.version('0.0.1');

program.command('browse-products')
    .description('Browse live products')
    .option('-f -filter <value>', 'Filter by product name')
    .action(container.resolve('products').showMenu);

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

