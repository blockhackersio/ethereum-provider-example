import { RLP } from "@ethereumjs/rlp";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import axios from "axios";

function hexToEth(hex: string) {
  return Number(BigInt(hex).toString()) / 1e18;
}

export const bigIntToUnpaddedBytes = (value: bigint): Uint8Array => {
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
};

async function main() {
  const sk =
    0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80n;

  const pk = secp256k1.ProjectivePoint.BASE.multiply(sk)
    .toRawBytes(false) // false here means uncompressed which adds 0x04 to start of bytes
    .slice(1);

  const address = "0x" + bytesToHex(keccak_256(pk).slice(-20));

  console.log(address);

  const tx = {
    chainId: bigIntToUnpaddedBytes(0x7a69n),
    nonce: new Uint8Array(0),
    maxPriorityFeePerGas: bigIntToUnpaddedBytes(0xan),
    maxFeePerGas: bigIntToUnpaddedBytes(875000000n),
    gasLimit: bigIntToUnpaddedBytes(0x5208n),
    to: bigIntToUnpaddedBytes(0x70997970c51812dc3a010c7d01b50e0d17dc79c8n),
    value: bigIntToUnpaddedBytes(0xde0b6b3a7640000n),
    data: new Uint8Array(0),
    accessList: [],
  };

  const message = new Uint8Array([
    0x02,
    ...RLP.encode([
      tx.chainId,
      tx.nonce,
      tx.maxPriorityFeePerGas,
      tx.maxFeePerGas,
      tx.gasLimit,
      tx.to,
      tx.value,
      undefined,
      tx.accessList,
    ]),
  ]);

  const msgHash = keccak_256(message);

  const sig = secp256k1.sign(msgHash, sk);

  const signedTx = {
    ...tx,
    v: bigIntToUnpaddedBytes(0x1n),
    r: bigIntToUnpaddedBytes(sig.r),
    s: bigIntToUnpaddedBytes(sig.s),
  };

  const signedRaw = new Uint8Array([
    0x02,
    ...RLP.encode([
      signedTx.chainId,
      signedTx.nonce,
      signedTx.maxPriorityFeePerGas,
      signedTx.maxFeePerGas,
      signedTx.gasLimit,
      signedTx.to,
      signedTx.value,
      signedTx.data,
      signedTx.accessList,
      signedTx.v,
      signedTx.r,
      signedTx.s,
    ]),
  ]);

  console.log("\nJSON-RPC =========");
  let payload: object = {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address],
    id: 1,
  };
  console.log(payload);
  let result = await axios.post("http://127.0.0.1:8545", payload);
  console.log(result.data);
  console.log(hexToEth(result.data.result) + " ETH");

  console.log("\nJSON-RPC =========");
  payload = {
    jsonrpc: "2.0",
    method: "eth_sendRawTransaction",
    params: ["0x" + bytesToHex(signedRaw)],
    id: 2,
  };

  console.log(payload);
  result = await axios.post("http://127.0.0.1:8545", payload);
  console.log(result.data);

  console.log("\nJSON-RPC =========");
  payload = {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address],
    id: 3,
  };
  console.log(payload);
  result = await axios.post("http://127.0.0.1:8545", payload);
  console.log(result.data);
  console.log(hexToEth(result.data.result) + " ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
