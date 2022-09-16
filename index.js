const {transactionDigest} = require('./transactions/signTransaction')
const createTransaction = require('./transactions/createTransaction')
const broadcastTransaction = require('./transactions/broadcastTransaction')
const broadcastTransactionNoResult = require('./transactions/broadcastTransactionNoResult')
const getCurrentChainId = require('./helpers/chainId')
const call = require('./helpers/call')
const config = require('./config')

/** Transaction for Hive blockchain */
class Transaction {
  /** A transaction object could be passed or created later
   * @param {function} sha256Lib External SHA256 implementation
   * @param {{}} trx Object of transaction - Optional
   * @param {string|Buffer} chainId Chain ID to be used for the transaction
   */
  constructor (sha256Lib, trx = null, chainId = getCurrentChainId()) {
    if (typeof chainId === 'string')
      chainId = Buffer.from(chainId,'hex')
    this.created = true
    if (!trx) {
      this.created = false
    }
    this.transaction = trx
    this.chainId = chainId
    this.sha256Lib = sha256Lib
  }

  /** Create the transaction by operations
   * @param {[Array]} operations
   * @param {Number} expiration Optional - Default 60 seconds
   */
  async create (operations, expiration = 60) {
    this.transaction = await createTransaction(operations, expiration)
    this.created = true
    return this.transaction
  }

  /**
   * Serialize tx for external signers.
   */
  serialize() {
    if (!this.created) {
      throw new Error('First create a transaction by .create(operations)')
    }
    const { digest, txId } = transactionDigest(this.sha256Lib, this.transaction, this.chainId)
    this.txId = txId
    return digest
  }

  /**
   * Append signatures from external signers
   * @param {String} signature a signature from external signer to be appended to transaction
   */
  appendSignature(signature) {
    if (!this.created)
      throw new Error('First create a transaction by .create(operations)')
    else if (!this.txId)
      throw new Error('Tx id not available yet, serialize() first to generate digest to be signed')
    if (!this.signedTransaction) {
      this.signedTransaction = {...this.transaction}
      if (!this.signedTransaction.signatures)
        this.signedTransaction.signatures = []
    }
    this.signedTransaction.signatures.push(signature)
  }

  async broadcast () {
    if (!this.created) {
      throw new Error('First create a transaction by .create(operations)')
    }
    if (!this.signedTransaction) {
      throw new Error('Sign transaction first and append signature with appendSignature()')
    }
    const result = await broadcastTransaction(this.signedTransaction)
    if (result.error) {
      return result
    }
    return {
      id: 1,
      jsonrpc: '2.0',
      result: { tx_id: this.txId, status: 'unknown' }
    }
  }
}

module.exports = { Transaction, call, config }
