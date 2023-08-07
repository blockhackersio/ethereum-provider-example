import { RLP } from "@ethereumjs/rlp";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import axios from "axios";
import assert from "assert";

async function main() {
  // Get the secret key
  const sk =
    0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80n;

  // Generate the public key
  const pk = secp256k1.ProjectivePoint.BASE.multiply(sk)
    .toRawBytes(false) // false here means uncompressed which adds 0x04 to start of bytes
    .slice(1);

  // Our address
  const address = "0x" + bytesToHex(keccak_256(pk).slice(-20));

  // Their address
  const them = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

  // Here are our basic transaction details
  const tx = {
    chainId: 31337n,
    nonce: 0n,
    maxPriorityFeePerGas: 10n,
    maxFeePerGas: 875000000n,
    gasLimit: 21000n,
    to: BigInt(them),
    value: 1_000000000000000000n,
    data: 0n,
    accessList: [],
  };

  // Encode the transaction details as a Uint8Array using RLP encoding
  const raw = new Uint8Array([
    0x02,
    ...RLP.encode([
      bigIntToUnpaddedBytes(tx.chainId),
      bigIntToUnpaddedBytes(tx.nonce),
      bigIntToUnpaddedBytes(tx.maxPriorityFeePerGas),
      bigIntToUnpaddedBytes(tx.maxFeePerGas),
      bigIntToUnpaddedBytes(tx.gasLimit),
      bigIntToUnpaddedBytes(tx.to),
      bigIntToUnpaddedBytes(tx.value),
      undefined,
      tx.accessList,
    ]),
  ]);

  // Get the message hash
  const msgHash = keccak_256(raw);

  // Generate a signature for the hash (r & s)
  const sig = secp256k1.sign(msgHash, sk);

  const signedTx = {
    ...tx,
    v: 0x1n, // This is required for signature recovery
    r: sig.r,
    s: sig.s,
  };

  const signedRaw = new Uint8Array([
    0x02,
    ...RLP.encode([
      bigIntToUnpaddedBytes(signedTx.chainId),
      bigIntToUnpaddedBytes(signedTx.nonce),
      bigIntToUnpaddedBytes(signedTx.maxPriorityFeePerGas),
      bigIntToUnpaddedBytes(signedTx.maxFeePerGas),
      bigIntToUnpaddedBytes(signedTx.gasLimit),
      bigIntToUnpaddedBytes(signedTx.to),
      bigIntToUnpaddedBytes(signedTx.value),
      signedTx.data,
      signedTx.accessList,
      bigIntToUnpaddedBytes(signedTx.v),
      bigIntToUnpaddedBytes(signedTx.r),
      bigIntToUnpaddedBytes(signedTx.s),
    ]),
  ]);

  // Get our balance
  let res = await axios.post("http://127.0.0.1:8545", {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address],
    id: 1,
  });
  assert(BigInt(res.data.result) === 10000_000000000000000000n);
  console.log(address + " " + hexToEth(res.data.result) + " ETH");

  // Get their balance
  res = await axios.post("http://127.0.0.1:8545", {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [them],
    id: 1,
  });
  assert(BigInt(res.data.result) === 10000_000000000000000000n);
  console.log(them + " " + hexToEth(res.data.result) + " ETH");

  // Submit signed transaction
  res = await axios.post("http://127.0.0.1:8545", {
    jsonrpc: "2.0",
    method: "eth_sendRawTransaction",
    params: ["0x" + bytesToHex(signedRaw)],
    id: 2,
  });
  console.log("Transaction submitted:\n " + res.data.result);

  // Get our balance
  res = await axios.post("http://127.0.0.1:8545", {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address],
    id: 3,
  });
  assert(BigInt(res.data.result) === 9998_999981625000000000n);
  console.log(address + " " + hexToEth(res.data.result) + " ETH");

  // Get their balance
  res = await axios.post("http://127.0.0.1:8545", {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [them],
    id: 1,
  });
  assert(BigInt(res.data.result) === 10001_000000000000000000n);
  console.log(them + " " + hexToEth(res.data.result) + " ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Helper for displaying eth amounts from a hex string
function hexToEth(hex: string) {
  return Number(BigInt(hex).toString()) / 1e18;
}

// Helper for preparing bigints for RLP encoding
function bigIntToUnpaddedBytes(value: bigint): Uint8Array {
  // First we get the hex string from the bigint

  let hex = value.toString(16);

  // Next we pad the string so we have an even number of bytes for each Uint8Array item
  let paddedHex = hex.length % 2 ? `0${hex}` : hex;

  // Then we convert to bytes
  let bytes = hexToBytes(paddedHex);

  // Then we ditch the leading 0 bytes
  let first = bytes[0];
  while (bytes.length > 0 && first.toString() === "0") {
    bytes = bytes.slice(1);
    first = bytes[0];
  }
  return bytes;
}
