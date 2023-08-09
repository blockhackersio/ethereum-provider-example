// https://vitalik.eth.limo/general/2023/01/20/stealth.html

import { bytesToNumberBE, numberToBytesBE } from "@noble/curves/abstract/utils";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";
import assert from "assert";

// Bob key
let b = secp256k1.utils.randomPrivateKey();
const B = secp256k1.ProjectivePoint.fromPrivateKey(b);

// Alice key
let a = secp256k1.utils.randomPrivateKey();
const A = secp256k1.ProjectivePoint.fromPrivateKey(a);

// Secrets
const S_b = A.multiply(bytesToNumberBE(b)).x;
const S_a = B.multiply(bytesToNumberBE(a)).x;

assert(S_a === S_b, "Shared secrets must match");

// Calculate the hash of S abailable to both Bob and Alice
const hashS = bytesToNumberBE(keccak_256(numberToBytesBE(S_a, 32)));

// P is Bob's public key available to both Bob and Alice
// Adding projects out on the Z axis so we need to go back to Affine representation
const P_ba = B.add(secp256k1.ProjectivePoint.BASE.multiply(hashS)).toAffine();

// p is Bob's private key only available to Bob because only he knows b
const p = (bytesToNumberBE(b) + hashS) % secp256k1.CURVE.n;

// Let's calculate P from the private key
const P = secp256k1.ProjectivePoint.fromPrivateKey(p);

assert(P_ba.x === P.x, "Public keys dont match");

console.log("BobsMetaAddress", {
  b: "0x" + bytesToHex(b),
  B: "0x" + bytesToHex(B.toRawBytes().slice(1)),
});
console.log("AlicesEphemeralAddress", {
  a: "0x" + bytesToHex(a),
  A: "0x" + bytesToHex(A.toRawBytes().slice(1)),
});
console.log("SharedSecret", { S: "0x" + S_b.toString(16) });
console.log("BobsKeypair", {
  P: "0x" + P_ba.x.toString(16),
  p: "0x" + p.toString(16),
});
