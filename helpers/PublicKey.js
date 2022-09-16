// const crypto = require('crypto')
const crypto = require('./crypto')
const bs58 = require('bs58')
const config = require('../config')

const DEFAULT_ADDRESS_PREFIX = config.address_prefix

/** ECDSA (secp256k1) public key. */
class PublicKey {
  /** Create a new instance from a WIF-encoded key. */
  static fromString (wif) {
    const { key, prefix } = decodePublic(wif)
    return new PublicKey(key, prefix)
  }

  /** Create a new instance. */
  static from (value) {
    if (value instanceof PublicKey) {
      return value
    } else {
      return PublicKey.fromString(value)
    }
  }

  constructor (key, prefix = DEFAULT_ADDRESS_PREFIX) {
    this.key = key
    this.prefix = prefix
    // assert(secp256k1.publicKeyVerify(key), 'invalid public key')
  }

  /** Return a WIF-encoded representation of the key. */
  toString () {
    return encodePublic(this.key, this.prefix)
  }

  /** Used by `utils.inspect` and `console.log` in node.js. */
  inspect () {
    return `PublicKey: ${this.toString()}`
  }
}

const encodePublic = (key, prefix) => {
  const checksum = crypto.ripemd160(key)
  return prefix + bs58.encode(Buffer.concat([key, checksum.slice(0, 4)]))
}

/** Decode bs58+ripemd160-checksum encoded public key. */
const decodePublic = encodedKey => {
  const prefix = encodedKey.slice(0, 3)
  encodedKey = encodedKey.slice(3)
  const buffer = Buffer.from(bs58.decode(encodedKey))
  const key = buffer.slice(0, -4)
  return { key, prefix }
}

module.exports = PublicKey
