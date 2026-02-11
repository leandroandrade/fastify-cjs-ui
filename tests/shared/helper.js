const createApp = require('../../src/app');

async function buildApp(customConfigs = { logger: false }) {
  return await createApp(customConfigs);
}

module.exports = {
  buildApp
};
