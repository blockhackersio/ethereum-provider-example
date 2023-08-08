import { secp256k1 } from "@noble/curves/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";
import { keccak_256 } from "@noble/hashes/sha3";
import assert from "assert";

async function main() {
  // Get the secret key
  const sk =
    0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80n;

  // Generate the public key
  const pk = secp256k1.ProjectivePoint.BASE.multiply(sk)
    .toRawBytes(false) // false here means uncompressed which adds 0x04 to start of bytes
    .slice(1);

  // Public keys are not addresses this is how we get our address
  const address = "0x" + bytesToHex(keccak_256(pk).slice(-20));

  assert("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" === address);

  const msg = "Hello World!";
  const msgHash = keccak_256(Buffer.from(msg));

  console.log("Message", {
    msg,
    hash: `0x${bytesToHex(msgHash)}`,
  });

  // Sign message
  const sig = secp256k1.sign(msgHash, sk);
  const compact = sig.toCompactRawBytes();
  const { r, s, recovery: v } = sig;

  console.log("Account", {
    PrivKey: `0x${sk.toString(16)}`,
    PubKey: `0x${bytesToHex(pk)}`,
    Address: address,
  });
  console.log("ECDSASignature", {
    r,
    s,
    v,
  });

  // Verify signature
  const pkFromSig = secp256k1.Signature.fromCompact(compact)
    .addRecoveryBit(v)
    .recoverPublicKey(msgHash)
    .toRawBytes(false) // false here means uncompressed which adds 0x04 to start of bytes
    .slice(1);

  // Get address
  const recoveredAddress = "0x" + bytesToHex(keccak_256(pkFromSig).slice(-20));
  console.log("RecoveredAddress", {
    recoveredAddress,
  });
  assert(recoveredAddress === address, "Signature verification failed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
