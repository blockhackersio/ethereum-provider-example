import { ProjPointType } from "@noble/curves/abstract/weierstrass";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { getRandomValues } from "crypto";

function bytesToNum(bytes: Uint8Array) {
  return BigInt(
    "0x" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
  );
}

function hashToCurve(message: string) {
  const hash = sha256(message);
  return secp256k1.ProjectivePoint.fromHex(hash);
}

function generateSignature(privateKey: bigint, message: string) {
  const hashedMessage = hashToCurve(message);
  return hashedMessage.multiply(privateKey);
}

function aggregateSignatures(signatures: ProjPointType<bigint>[]) {
  return signatures.reduce((prev, curr) => {
    return prev.add(curr);
  }, secp256k1.ProjectivePoint.ZERO);
}

const messages = ["Hello", "World!"];
const privateKeys = [
  bytesToNum(getRandomValues(new Uint8Array(33))),
  bytesToNum(getRandomValues(new Uint8Array(33))),
];

let signatures = [];
for (let i = 0; i < messages.length; i++) {
  let signature = generateSignature(privateKeys[i], messages[i]);
  signatures.push(signature);
}

let aggregateSig = aggregateSignatures(signatures);
