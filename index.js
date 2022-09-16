const {transactionDigest, signTransaction} = require('./transactions/signTransaction')
const createTransaction = require('./transactions/createTransaction')
const broadcastTransaction = require('./transactions/broadcastTransaction')
const broadcastTransactionNoResult = require('./transactions/broadcastTransactionNoResult')
const getCurrentChainId = require('./helpers/chainId')
const PrivateKey = require('./helpers/PrivateKey')
const PublicKey = require('./helpers/PublicKey')
const Signature = require('./helpers/Signature')
const call = require('./helpers/call')
const config = require('./config')
const updateOperations = () => {
  console.log(
    '[Hive-tx] Warning: You can safely remove `.updateOperations()` from you app. Deprecated.'
  )
}

/** Transaction for Hive blockchain */
class Transaction {
  /** A transaction object could be passed or created later
   * @param {{}} trx Object of transaction - Optional
   */
  constructor (trx = null, chainId = getCurrentChainId()) {
    this.created = true
    if (!trx) {
      this.created = false
    }
    this.transaction = trx
    this.chainId = chainId
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
    const { digest, txId } = transactionDigest(transaction, this.chainId)
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

  /** Sign the transaction by key or keys[] (supports multi signature)
   * @param {PrivateKey|[PrivateKey]} keys single key or multiple keys in array
   */
  sign (keys) {
    if (!this.created) {
      throw new Error('First create a transaction by .create(operations)')
    }
    const { signedTransaction, txId } = signTransaction(this.transaction, keys)
    this.signedTransaction = signedTransaction
    this.txId = txId
    return this.signedTransaction
  }

  async broadcast () {
    if (!this.created) {
      throw new Error('First create a transaction by .create(operations)')
    }
    if (!this.signedTransaction) {
      throw new Error('First sign the transaction by .sign(keys)')
    }
    const result = await broadcastTransaction(this.signedTransaction)
    if (result.error) {
      return result
    }
    return {
      id: 1,
      jsonrpc: '2.0',
      result: { tx_id: this.txId, status: 'unkown' }
    }
  }

  /** Fast broadcast - No open connection */
  async broadcastNoResult () {
    console.log('Deprecated: .broadcastNoResult() is identical to .broadcast() - use .broadcast() instead')
    if (!this.created) {
      throw new Error('First create a transaction by .create(operations)')
    }
    if (!this.signedTransaction) {
      throw new Error('First sign the transaction by .sign(keys)')
    }
    await broadcastTransactionNoResult(this.signedTransaction)
    return {
      id: 1,
      jsonrpc: '2.0',
      result: { tx_id: this.txId, status: 'unkown' }
    } // result
  }
}

module.exports = { Transaction, PrivateKey, call, config, updateOperations, PublicKey, Signature }
