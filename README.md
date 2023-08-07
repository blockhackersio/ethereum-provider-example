# Create and submit a raw Ethereum Transaction

This repo shows how to create and submit a raw ethereum transaction

```ts
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
const themBigInt = 0x70997970c51812dc3a010c7d01b50e0d17dc79c8n;
const them = "0x" + themBigInt.toString(16);

// Here are our basic transaction details
const tx = {
  chainId: bigIntToUnpaddedBytes(0x7a69n),
  nonce: new Uint8Array(0),
  maxPriorityFeePerGas: bigIntToUnpaddedBytes(0xan),
  maxFeePerGas: bigIntToUnpaddedBytes(875000000n),
  gasLimit: bigIntToUnpaddedBytes(0x5208n),
  to: bigIntToUnpaddedBytes(themBigInt),
  value: bigIntToUnpaddedBytes(0xde0b6b3a7640000n),
  data: new Uint8Array(0),
  accessList: [],
};

// Encode the transaction details as a Uint8Array using RLP encoding
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

// Get the message hash
const msgHash = keccak_256(message);

// Generate a signature for the hash (r & s)
const sig = secp256k1.sign(msgHash, sk);

const signedTx = {
  ...tx,
  v: bigIntToUnpaddedBytes(0x1n), // This is required for signature recovery
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
  pSample Hardhat Projectarams: [them],
  id: 1,
});
assert(BigInt(res.data.result) === 10001_000000000000000000n);
console.log(them + " " + hexToEth(res.data.result) + " ETH");
```
