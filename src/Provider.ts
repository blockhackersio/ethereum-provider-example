import * as ethers from "ethers";
import axios from "axios";
import { Account } from "./Account.js";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";

class ProviderRpcError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: number,
    public readonly data?: unknown
  ) {
    super(message);
  }
}

export class Provider implements ethers.providers.ExternalProvider {
  constructor(
    private account: Account,
    public readonly host = "http://127.0.0.1:8545",
    private id = 0
  ) {}

  private getId() {
    return ++this.id;
  }

  private async _executeRequest(request: {
    method: string;
    params?: Array<any>;
  }) {
    const res = await axios.post(this.host, {
      jsonrpc: "2.0",
      method: request.method,
      params: request.params,
      id: this.getId(),
    });

    return res.data.result;
  }

  async request(request: { method: string; params?: Array<any> }) {
    if (
      ["eth_sign", "eth_signTransaction", "eth_call"].includes(request.method)
    ) {
      throw new ProviderRpcError("Unauthorized", 4100);
    }

    if (["eth_sendTransaction"].includes(request.method)) {
      const [txData] = request.params ?? [];

      const tx = FeeMarketEIP1559Transaction.fromTxData({
        chainId: 31337,
        gasLimit: 21000,
        maxFeePerGas: 875000000,
        maxPriorityFeePerGas: 10,
        ...txData,
      });
      const signedTx = this.account.sign(tx);
      const txHex = "0x" + signedTx.serialize().toString("hex");

      const res = await this._executeRequest({
        method: "eth_sendRawTransaction",
        params: [txHex],
      });
      this.account.incrementNonce();
      return res;
    }

    return await this._executeRequest(request);
  }
}
