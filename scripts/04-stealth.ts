// https://vitalik.eth.limo/general/2023/01/20/stealth.html

import { bytesToNumberBE, numberToBytesBE } from "@noble/curves/abstract/utils";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";
import assert from "assert";

// Bob key
let B_sk = secp256k1.utils.randomPrivateKey();
const B_pk = secp256k1.ProjectivePoint.fromPrivateKey(B_sk);

// Alice key
let A_sk = secp256k1.utils.randomPrivateKey();
const A_pk = secp256k1.ProjectivePoint.fromPrivateKey(A_sk);

// Secrets
const S_1 = A_pk.multiply(bytesToNumberBE(B_sk)).x;
const S_2 = B_pk.multiply(bytesToNumberBE(A_sk)).x;

assert(S_2 === S_1, "Shared secrets must match");

// Calculate the hash of S abailable to both Bob and Alice
const hashS = bytesToNumberBE(keccak_256(numberToBytesBE(S_2, 32)));

// P is Bob's public key available to both Bob and Alice
// Adding projects out on the Z axis so we need to go back to Affine representation
const P_pk = B_pk.add(secp256k1.ProjectivePoint.BASE.multiply(hashS))
  .toRawBytes(false)
  .slice(1);

const P_address = bytesToHex(keccak_256(P_pk).slice(-20));

// p is Bob's private key only available to Bob because only he knows b
const P_sk = (bytesToNumberBE(B_sk) + hashS) % secp256k1.CURVE.n;

// Let's calculate P from the private key
const P_pk2 = secp256k1.ProjectivePoint.fromPrivateKey(P_sk)
  .toRawBytes(false)
  .slice(1);

assert(bytesToHex(P_pk) === bytesToHex(P_pk2), "Public keys dont match");

console.log("BobsMetaAddress", {
  sk: "0x" + bytesToHex(B_sk),
  pk: "0x" + bytesToHex(B_pk.toRawBytes().slice(1)),
});
console.log("AlicesEphemeralAddress", {
  sk: "0x" + bytesToHex(A_sk),
  pk: "0x" + bytesToHex(A_pk.toRawBytes().slice(1)),
});
console.log("SharedSecret", { S: "0x" + S_1.toString(16) });
console.log("BobsAddress", {
  sk: "0x" + P_sk.toString(16),
  pk: "0x" + bytesToHex(P_pk),
  address: "0x" + P_address,
});
