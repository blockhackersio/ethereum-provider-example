import { RLP } from "@ethereumjs/rlp";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import axios from "axios";
import assert from "assert";
import { ethers } from "ethers";
import { abi, bytecode } from "../artifacts/contracts/Counter.sol/Counter.json";

const NODE_LOCATION = "http://127.0.0.1:8545/";

async function deploy() {
  const provider = new ethers.JsonRpcProvider(NODE_LOCATION);
  const factory = new ethers.ContractFactory(
    abi,
    bytecode,
    await provider.getSigner("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
  );
  const contract = await factory.deploy();
  const address = await contract.getAddress();
  return address;
}

function signTransaction(
  tx: {
    chainId: bigint;
    nonce: bigint;
    maxPriorityFeePerGas: bigint;
    maxFeePerGas: bigint;
    gasLimit: bigint;
    to: bigint;
    value: bigint;
    data: bigint;
    accessList: never[];
  },
  sk: bigint
) {
  console.log(`The Transaction is `, tx);

  // Encode the transaction details as a Uint8Array using RLP encoding
  const raw = new Uint8Array([
    0x02,
    ...RLP.encode([
      bigIntToBytes(tx.chainId),
      bigIntToBytes(tx.nonce),
      bigIntToBytes(tx.maxPriorityFeePerGas),
      bigIntToBytes(tx.maxFeePerGas),
      bigIntToBytes(tx.gasLimit),
      bigIntToBytes(tx.to),
      bigIntToBytes(tx.value),
      tx.data,
      tx.accessList,
    ]),
  ]);

  // Get the message hash
  const msgHash = keccak_256(raw);

  // Generate a signature for the hash (r & s)
  const sig = secp256k1.sign(msgHash, sk);

  const signedTx = {
    ...tx,
    v: BigInt(sig.recovery), //+ 27n + 2n * BigInt(chainId),
    r: sig.r,
    s: sig.s,
  };

  console.log(`The Signed Transaction is `, signedTx);

  const signedRaw = new Uint8Array([
    0x02,
    ...RLP.encode([
      bigIntToBytes(signedTx.chainId),
      bigIntToBytes(signedTx.nonce),
      bigIntToBytes(signedTx.maxPriorityFeePerGas),
      bigIntToBytes(signedTx.maxFeePerGas),
      bigIntToBytes(signedTx.gasLimit),
      bigIntToBytes(signedTx.to),
      bigIntToBytes(signedTx.value),
      signedTx.data,
      signedTx.accessList,
      bigIntToBytes(signedTx.v),
      bigIntToBytes(signedTx.r),
      bigIntToBytes(signedTx.s),
    ]),
  ]);

  const rawSignedTx = "0x" + bytesToHex(signedRaw);
  console.log(`The Raw Signed Transaction is:\n `, rawSignedTx);
  return rawSignedTx;
}

async function main() {
  // This keeps track of our rpc calls
  let rpcId = 40;
  let nonce = 1n;

  // deploy with ethers
  const contractAddress = await deploy();

  // Get the secret key
  const sk =
    0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80n;

  // Generate the public key
  const pk = secp256k1.ProjectivePoint.BASE.multiply(sk)
    .toRawBytes(false) // false here means uncompressed which adds 0x04 to start of bytes
    .slice(1);

  // Public keys are not addresses this is how we get Our address
  const address = "0x" + bytesToHex(keccak_256(pk).slice(-20));

  console.log("Account", {
    PrivKey: `0x${sk.toString(16)}`,
    PubKey: `0x${bytesToHex(pk)}`,
    Address: address,
  });

  // Get the chainId
  let res = await axios.post(NODE_LOCATION, {
    jsonrpc: "2.0",
    method: "eth_chainId",
    params: [],
    id: ++rpcId,
  });
  const chainId = BigInt(res.data.result);
  console.log(`The chainId is ${chainId}`);

  // Prepare smart contract call

  const setCount = (amount: bigint) =>
    BigInt(
      "0x" +
        bytesToHex(
          new Uint8Array([
            // Function sig
            ...keccak_256(
              hexToBytes(fromAscii("setCount(uint256)").slice(2))
            ).slice(0, 4),
            // Argument
            ...padBytes(amount, 32),
          ])
        )
    );
  const getCount = () =>
    BigInt(
      "0x" +
        bytesToHex(
          new Uint8Array([
            // Function sig
            ...keccak_256(hexToBytes(fromAscii("getCount()").slice(2))).slice(
              0,
              4
            ),
          ])
        )
    );

  const increment = () =>
    BigInt(
      "0x" +
        bytesToHex(
          // Function sig
          keccak_256(hexToBytes(fromAscii("increment()").slice(2))).slice(0, 4)
        )
    );

  const decrement = () =>
    BigInt(
      "0x" +
        bytesToHex(
          // Function sig
          keccak_256(hexToBytes(fromAscii("increment()").slice(2))).slice(0, 4)
        )
    );

  // Here are our basic transaction details
  res = await axios.post(NODE_LOCATION, {
    jsonrpc: "2.0",
    method: "eth_sendRawTransaction",
    params: [
      signTransaction(
        {
          chainId,
          nonce: nonce++, // This must increase for every tx
          maxPriorityFeePerGas: 10n,
          maxFeePerGas: 875000000n,
          gasLimit: 90000n,
          to: BigInt(contractAddress),
          value: 0n,
          data: setCount(10n),
          accessList: [],
        },
        sk
      ),
    ],
    id: ++rpcId,
  });
  console.log("Transaction submitted:\n " + res.data.result);

  res = await axios.post(NODE_LOCATION, {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        to: contractAddress,
        data: "0x" + getCount().toString(16),
      },
      "latest",
    ],
    id: ++rpcId,
  });

  assert(BigInt(res.data.result) === 10n);

  // Here are our basic transaction details
  res = await axios.post(NODE_LOCATION, {
    jsonrpc: "2.0",
    method: "eth_sendRawTransaction",
    params: [
      signTransaction(
        {
          chainId,
          nonce: nonce++, // This must increase for every tx
          maxPriorityFeePerGas: 10n,
          maxFeePerGas: 875000000n,
          gasLimit: 90000n,
          to: BigInt(contractAddress),
          value: 0n,
          data: increment(),
          accessList: [],
        },
        sk
      ),
    ],
    id: ++rpcId,
  });
  console.log("Transaction submitted:\n " + res.data.result);
  res = await axios.post(NODE_LOCATION, {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        to: contractAddress,
        data: "0x" + getCount().toString(16),
      },
      "latest",
    ],
    id: ++rpcId,
  });

  assert(BigInt(res.data.result) === 11n);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function fromAscii(stringValue: string) {
  let hex = "";
  for (let i = 0; i < stringValue.length; i++) {
    const code = stringValue.charCodeAt(i);
    const n = code.toString(16);
    hex += n.length < 2 ? `0${n}` : n;
  }

  return `0x${hex}`;
}

function padBytes(n: bigint, len: number) {
  let hex = n.toString(16);
  hex = hex.length % 2 !== 0 ? "0" + hex : hex;
  const bytes = hexToBytes(hex);
  if (len < bytes.length)
    throw new Error("Byte length is greater than padding");
  return new Uint8Array([...new Uint8Array(len - bytes.length), ...bytes]);
}

// Helper for preparing bigints for RLP encoding
function bigIntToBytes(value: bigint): Uint8Array {
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
