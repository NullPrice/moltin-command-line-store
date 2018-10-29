# moltin-command-line-store

A basic command line implementation of the Moltin API demonstrating how Moltin could be used via a command line interface.

## Usage 

Run `npm install`

Create either an environment variable named `MOLTIN_CLIENT_ID` assigned with your moltin client id or a  `.env` file in project root with the same details. 

Run `node index.js` and you will be prompted with a basic command line interface that allows you to browse your products, create a cart and create an order from your cart. 


## Testing

Run `npm test` to run the Jest unit tests

## TODO

- Unit test coverage
- More product filtering options
- Payment processing