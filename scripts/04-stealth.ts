// https://vitalik.eth.limo/general/2023/01/20/stealth.html

import { bytesToNumberBE, numberToBytesBE } from "@noble/curves/abstract/utils";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import assert from "assert";

// Bob key
let b = secp256k1.utils.randomPrivateKey();
const B = secp256k1.ProjectivePoint.fromPrivateKey(b);
console.log("BobsMetaAddress", { b, B });

// Alice key
let a = secp256k1.utils.randomPrivateKey();
const A = secp256k1.ProjectivePoint.fromPrivateKey(a);
console.log("AlicesMetaAddress", { a, A });

// Secrets
const S_b = A.multiply(bytesToNumberBE(b)).x;
const S_a = B.multiply(bytesToNumberBE(a)).x;

console.log({ S_b, S_a });

// Calculate the hash of S abailable to both Bob and Alice
const hashS = bytesToNumberBE(keccak_256(numberToBytesBE(S_a, 32)));

// P is Bob's public key available to both Bob and Alice
// Adding projects out on the Z axis so we need to go back to Affine representation
const P = B.add(secp256k1.ProjectivePoint.BASE.multiply(hashS)).toAffine();

// p is Bob's private key only available to Bob because only he knows b
const p = (bytesToNumberBE(b) + hashS) % secp256k1.CURVE.n;

assert(P.x === secp256k1.ProjectivePoint.BASE.multiply(p).x);
