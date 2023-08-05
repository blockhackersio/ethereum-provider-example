# Ethereum Provider Example

An example for how to create a simple Ethereum provider for illustrative purposes. 


```ts
import { Provider, Account } from "./index.js";
const privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80n;
const account = Account.fromPrivateKey(privateKey);
const ethereum = new Provider(account);
const provider = new ethers.providers.Web3Provider(ethereum, 31337);

const signer = provider.getSigner(
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
);

await signer.sendTransaction({
  from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  value: 1_000000000000000000n,
  nonce: 0,
});
```

## Install dependencies

```bash
pnpm install
```

## To run tests

```bash
pnpm test
```

Please note this code is only for educational purposes and should not be used in production. 