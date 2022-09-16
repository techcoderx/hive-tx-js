const ByteBuffer = require('bytebuffer')
const serializer = require('../helpers/serializer')
const getCurrentChainId = require('../helpers/chainId')

/** Serialize transaction */
const transactionDigest = (sha256, transaction, chainId = getCurrentChainId()) => {
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
  const txId = sha256(transactionData).toString('hex').slice(0, 40)
  const digest = sha256(Buffer.concat([chainId, transactionData]))
  return { digest, txId }
}

module.exports = {transactionDigest}
