const Commander = require('commander');
const MoltinGateway = require('@moltin/sdk').gateway;
const Config = require('./config');
const Moltin = MoltinGateway({
    client_id: Config.client_id
  });

Commander.version('1.0.0')
    .option('-l --list-products')
    .parse(process.argv);

if (Commander.listProducts){
    Moltin.Products.All().then(products => {
        console.log(products)
      })
}