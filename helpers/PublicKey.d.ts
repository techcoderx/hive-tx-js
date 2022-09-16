export class PublicKey {
  key: Buffer
  prefix: string

  static fromString(wif: string): PublicKey

  static from(value: string | PublicKey): PublicKey

  constructor(key: Buffer, prefix?: string)
}
