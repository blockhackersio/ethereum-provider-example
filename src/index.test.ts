import { ethers } from "ethers";
import { Provider, Account } from "./index.js";
import { createHardhatService } from "./utils.js";

function getTestAccount(privateKey: bigint) {
  const account = Account.fromPrivateKey(privateKey);
  const ethereum = new Provider(account);
  const provider = new ethers.providers.Web3Provider(ethereum, 31337);
  return { ethereum, provider, account };
}

const FIRST_HARDHAT_ACCOUNT =
  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80n;

// This sets up hardhat's eth client to start for each test
// This can help with deterministic tests
const hardhat = createHardhatService();

beforeEach(async () => hardhat.start());

afterEach(async () => hardhat.stop());

test("Check balance", async () => {
  const { provider } = getTestAccount(FIRST_HARDHAT_ACCOUNT);
  let bal = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  expect(bal.toBigInt()).toBe(10000000000000000000000n);
});

test("Can make a transaction", async () => {
  const { provider, account } = getTestAccount(FIRST_HARDHAT_ACCOUNT);

  const signer = provider.getSigner(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  const initBal = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  const ONE_ETH = 1000000000000000000n;

  const res1 = await signer.sendTransaction({
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
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
    value: ONE_ETH,
    nonce: account.getNonce(),
  });

  totalGas = calculateTotalGas(await res2.wait());

  const bal2 = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  expect(bal2.toBigInt()).toBe(bal1.toBigInt() - ONE_ETH - totalGas);
});

function calculateTotalGas(receipt: ethers.providers.TransactionReceipt) {
  const { gasUsed, effectiveGasPrice } = receipt;
  return gasUsed.toBigInt() * effectiveGasPrice.toBigInt();
}
