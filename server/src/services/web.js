const { ServiceBroker } = require("moleculer");
const ApiService = require("moleculer-web");

const broker = new ServiceBroker();

module.exports = {
  mixins: [ApiService],
  settings: {
    port: 9007,
    path: '/api/blacklist',
    routes: [{
      path: '',
      aliases: {
        'GET /': 'blocklist.getLatestCached',
        'GET /filter/:FilterDomain': 'blocklist.getFiltered',
      }
    }]
  }
}