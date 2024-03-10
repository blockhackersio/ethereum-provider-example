# 🥩 Ethereum in the Raw 🫢

This repo explores raw ethereum interactions and cryptography. It is partially in order to understand the protocol better at a deeper level myself but also to inform future projects I undertake.

- [x] [Original Diffie Hellman (modular arithetic)](scripts/00-diffie-hellman.ts)
- [x] [Elliptic Curve Diffie Hellman](scripts/01-ec-diffie-hellman.ts)
- [x] [Basic ECDSA Signatures and generating addresses](scripts/02-ecdsa-ethereum.ts)
- [x] [Send ETH to anyone](scripts/03-transaction.ts)
- [x] [Interact with a smart contract](scripts/04-contract.ts)
- [x] [Stealth Addresses](scripts/05-stealth.ts)
- [ ] Deploy a contract
- [ ] CREATE2 address generation
- [ ] Create a simple EIP-1193 provider
- [ ] Submit a EIP-4337 UserOperation
- [ ] Paymaster
- [ ] BLS signature aggregation
- [ ] R1CS Encoding
- [ ] KZG commitment
- [ ] Zero Knowledge Proof

_Please note that this does not fully cover all the checks and error handling that should be done in a production environment. This code is exclusively for illustrative purposes only and is not production code and is not meant to be used for production in anyway._
