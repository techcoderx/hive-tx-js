import { PublicKey as PubK } from './helpers/PublicKey'

declare module 'hive-tx'

export class PublicKey extends PubK {}
export class Transaction {
  constructor(sha256Lib: (input: any) => Buffer, trx?: object, chainId?: string | Buffer)

  broadcast(node?: string): Promise<{
    id: number
    jsonrpc: string
    result: { tx_id: string; status: string }
  } | {error: object}>

  create(
    operations: any[],
    expiration?: number,
    node?: string
  ): Promise<{
    expiration: string
    extensions: any[]
    operations: any[]
    ref_block_num: number
    ref_block_prefix: number
  }>

  serialize(): Buffer

  appendSignature(signature: string): void
}

export const config: {
  address_prefix: string
  chain_id: string
  node: string
}

export function call(method: string, params?: any[], timeout?: number): any

/** Don't need anymore - deprecated */
export function updateOperations(): void
