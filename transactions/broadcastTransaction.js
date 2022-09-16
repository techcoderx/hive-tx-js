const call = require('../helpers/call')

/** Broadcast signed transaction */
const broadcastTransaction = async (signedTransaction, node = '') => {
  const result = await call('condenser_api.broadcast_transaction', [
    signedTransaction
  ],node)
  return result
}

module.exports = broadcastTransaction
