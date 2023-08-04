import { providers } from "ethers";
import { Provider } from "./index.js";

test("Provider", async () => {
  const ethereum = new Provider();
  const provider = new providers.Web3Provider(ethereum);

  const bal = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  expect(`${bal}`).toBe("10000000000000000000000");
});

test("Cannot send ETH", async () => {
  const ethereum = new Provider();
  const provider = new providers.Web3Provider(ethereum);
  const signer = provider.getSigner(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  try {
    await signer.sendTransaction({
      from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      value: "1000000000000000000",
      nonce: 1,
    });
  } catch (err) {
    expect(`${err}`).toMatch("Unauthorized");
  }
});
