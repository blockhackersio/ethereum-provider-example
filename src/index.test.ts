import { ethers } from "ethers";
import { Provider, Account } from "./index.js";
import contractAbi from "../artifacts/contracts/Counter.sol/Counter.json";

const HARDHAT_ACCOUNTS = [
  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80n,
  0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690dn,
  0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365an,
];

async function deployContract() {
  const { provider } = getTestAccount(HARDHAT_ACCOUNTS[2]);
  // const provider = new ethers.providers.JsonRpcProvider(
  //   "http://127.0.0.1:8543",
  //   31337
  // );
  const factory = new ethers.ContractFactory(
    contractAbi.abi,
    contractAbi.bytecode,
    provider.getSigner("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")
  );
  const deployed = await factory.deploy();
  console.log(deployed.address);
}

function getJsonAccount() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8543",
    31337
  );
  return { provider };
}

function getTestAccount(privateKey: bigint) {
  const account = Account.fromPrivateKey(privateKey);
  const ethereum = new Provider(account);
  const provider = new ethers.providers.Web3Provider(ethereum, 31337);
  return { ethereum, provider, account };
}

// This sets up hardhat's eth client to start for each test
// This can help with deterministic tests
// const hardhat = createHardhatService();

beforeEach(async () => {
  // await hardhat.start();
  await deployContract();
});

// afterEach(async () => hardhat.stop());

test("Check balance", async () => {
  const { provider } = getTestAccount(HARDHAT_ACCOUNTS[0]);

  let bal = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  expect(bal.toBigInt()).toBe(10000000000000000000000n);
});

test.only("Can make a transaction", async () => {
  const { provider, account } = getTestAccount(HARDHAT_ACCOUNTS[0]);
  // const { account } = getTestAccount(HARDHAT_ACCOUNTS[0]);
  // const { provider } = getJsonAccount();
  const signer = provider.getSigner(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  const initBal = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  const ONE_ETH = 1_000000000000000000n;

  const res1 = await signer.sendTransaction({
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    gasLimit: 90000,
    maxFeePerGas: 875000000,
    chainId: 31337,
    value: ONE_ETH,
    nonce: account.getNonce(),
  });

  let totalGas = calculateTotalGas(await res1.wait());

  const bal1 = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  expect(bal1.toBigInt()).toBe(initBal.toBigInt() - ONE_ETH - totalGas);

  const res2 = await signer.sendTransaction({
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    gasLimit: 90000,
    maxFeePerGas: 875000000,
    chainId: 31337,
    value: ONE_ETH,
    nonce: account.getNonce(),
  });

  totalGas = calculateTotalGas(await res2.wait());

  const bal2 = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  expect(bal2.toBigInt()).toBe(bal1.toBigInt() - ONE_ETH - totalGas);
});

test("Can make a transaction", async () => {
  // const { provider, account } = getTestAccount(HARDHAT_ACCOUNTS[0]);
  // const signer = provider.getSigner(
  //   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  // );
  // const contract = new Contract(
  //   "0x663F3ad617193148711d28f5334eE4Ed07016602",
  //   contractAbi.abi,
  //   signer
  // ) as any as Counter;
  // const count = await contract.getCount();
  // expect(count.toBigInt()).toBe(0n);
  // await contract.increment();
});

function calculateTotalGas(receipt: ethers.providers.TransactionReceipt) {
  const { gasUsed, effectiveGasPrice } = receipt;
  return gasUsed.toBigInt() * effectiveGasPrice.toBigInt();
}
