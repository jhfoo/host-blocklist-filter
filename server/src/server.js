const { ServiceBroker } = require("moleculer"),
  blockllist = require('./services/blocklist'),
  web = require('./services/web')

// Create a ServiceBroker
const broker = new ServiceBroker();

// Define a service
broker.createService(blockllist);
broker.createService(web);

// Start the broker
broker.start()
    // // Call the service
    // .then(() => broker.call("math.add", { a: 5, b: 3 }))
    // // Print the response
    // .then(res => console.log("5 + 3 =", res))
    .catch(err => console.error(`Error occured! ${err.message}`));