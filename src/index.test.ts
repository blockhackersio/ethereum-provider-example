import { ethers } from "ethers";
import { Provider } from "./Provider.js";
import { Account } from "./Account.js";
import { HardHatService, runHardhatInstance } from "./utils.js";

let backend: HardHatService;
let provider: ethers.providers.Web3Provider;
let account: Account;

beforeEach(async () => {
  backend = runHardhatInstance();
  await backend.ready();
  account =
    Account.fromPrivateKey(
      0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80n
    );
  const ethereum = new Provider(account);
  provider = new ethers.providers.Web3Provider(ethereum, 31337);
});

afterEach(async () => {
  await backend.close();
});

test("Check balance", async () => {
  let bal = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  expect(`${bal}`).toBe("10000000000000000000000");
});

test("Can make a transaction", async () => {
  const signer = provider.getSigner(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  await signer.sendTransaction({
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    value: "1000000000000000000",
    nonce: account.getNonce(),
  });

  await signer.sendTransaction({
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    value: "1000000000000000000",
    nonce: account.getNonce(),
  });

  const bal = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  expect(`${bal}`).toBe("9997999965543659165000");
});
