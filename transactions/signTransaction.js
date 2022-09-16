const ByteBuffer = require('bytebuffer')
const serializer = require('../helpers/serializer')
const crypto = require('../helpers/crypto')
const getCurrentChainId = require('../helpers/chainId')

/** Serialize transaction */
const transactionDigest = (transaction, chainId = getCurrentChainId()) => {
  const buffer = new ByteBuffer(
    ByteBuffer.DEFAULT_CAPACITY,
    ByteBuffer.LITTLE_ENDIAN
  )
  try {
    serializer.Transaction(buffer, transaction)
  } catch (cause) {
    throw new Error('Unable to serialize transaction')
  }
  buffer.flip()
  const transactionData = Buffer.from(buffer.toBuffer())
  const txId = crypto.sha256(transactionData).toString('hex').slice(0, 40)
  const digest = crypto.sha256(Buffer.concat([chainId, transactionData]))
  return { digest, txId }
}

module.exports = {transactionDigest}
