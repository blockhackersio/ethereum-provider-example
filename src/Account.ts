import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { numberToBytesBE, bytesToHex } from "@noble/curves/abstract/utils";
import { hexToBytes } from "@noble/hashes/utils";

function privateToPub(privateKey: Uint8Array) {
  return secp256k1.ProjectivePoint.fromPrivateKey(privateKey)
    .toRawBytes(false)
    .slice(1);
}

function pubToAddress(pubKey: Uint8Array) {
  return keccak_256(pubKey).slice(-20);
}

function normalizeToUint8Array(input: bigint | Uint8Array | string) {
  if (typeof input === "bigint") {
    return numberToBytesBE(input, secp256k1.CURVE.nByteLength);
  }

  if (typeof input === "string") {
    return hexToBytes(input);
  }

  return input;
}

export class Account {
  private readonly privateKey: Uint8Array;
  private nonce: number;
  public readonly publicKey: Uint8Array;
  public readonly address: Uint8Array;

  constructor(privateKey: Uint8Array) {
    this.privateKey = privateKey;
    this.publicKey = privateToPub(privateKey);
    this.address = pubToAddress(this.publicKey);
    this.nonce = 0;
  }

  getAddress() {
    return bytesToHex(this.address);
  }

  getNonce() {
    return this.nonce;
  }

  incrementNonce() {
    return ++this.nonce;
  }

  sign(transaction: FeeMarketEIP1559Transaction) {
    return transaction.sign(Buffer.from(this.privateKey));
  }

  static fromRandomBytes() {
    return new Account(secp256k1.utils.randomPrivateKey());
  }

  static fromPrivateKey(sk: bigint | Uint8Array | string) {
    const skU8 = normalizeToUint8Array(sk);
    return new Account(skU8);
  }
}
