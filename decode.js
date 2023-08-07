import { Common } from "@ethereumjs/common";
import { Transaction } from "@ethereumjs/tx";
const txBuffer = Buffer.from(
  "02f871827a69800a84342770c083015f909470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c001a0e769165bb1bff517ab5bf0e8db31ec3e0a3eb81cd16199a87b0e7a575efd30e9a06b064ca3e7223354523f305c9e4930073e77fccd3efc033a943e0bf3588dc72c",
  "hex"
);

const common = Common.custom({ chainId: 31337 });
const tx = Transaction.fromSerializedTx(txBuffer, { common });

console.log(tx);
