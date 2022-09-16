// get current chain id from config
const config = require('../config')
module.exports = () => Buffer.from(config.chain_id, 'hex')