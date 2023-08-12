import {
  bytesToNumberBE,
  numberToHexUnpadded,
} from "@noble/curves/abstract/utils";
import { ProjPointType } from "@noble/curves/abstract/weierstrass";
import { secp256k1 } from "@noble/curves/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import assert from "assert";

async function main() {
  // Alice key
  let a = bytesToNumberBE(secp256k1.utils.randomPrivateKey());
  const A = secp256k1.ProjectivePoint.BASE.multiply(a);

  // Bob key
  let b = bytesToNumberBE(secp256k1.utils.randomPrivateKey());
  const B = secp256k1.ProjectivePoint.BASE.multiply(b);

  // Secrets
  const S_1 = A.multiply(b).x;
  const S_2 = B.multiply(a).x;
  assert(S_2 === S_1, "Shared secrets must match");

  // Report
  console.log("PublicKeys", {
    A: pointToHex(A),
    B: pointToHex(B),
  });

  console.log("PrivateInfo", {
    a: "0x" + numberToHexUnpadded(a),
    b: "0x" + numberToHexUnpadded(b),
    S: "0x" + numberToHexUnpadded(S_1), // secret is shared
  });
}

const pointToHex = (p: ProjPointType<bigint>) =>
  "0x" + bytesToHex(p.toRawBytes(false).slice(1));

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
