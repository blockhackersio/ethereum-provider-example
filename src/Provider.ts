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

class ProviderError extends Error {
  constructor(
    public message: string,
    public code: number,
    public data?: unknown
  ) {
    super(message);
  }
}
export class Provider implements ethers.providers.ExternalProvider {
  constructor(
    private account: Account,
    public readonly host = "http://127.0.0.1:8543",
    private id = 41
  ) {}

  private getId() {
    return ++this.id;
  }

  private async _executeRequest(request: {
    method: string;
    params?: Array<any>;
  }) {
    try {
      const res = await axios.post(this.host, {
        jsonrpc: "2.0",
        method: request.method,
        params: request.params,
        id: this.getId(),
      });
      return res.data.result;
    } catch (err) {
      const e = new ProviderError(`${err}`, 4200);
    }
  }

  async request(request: { method: string; params?: Array<any> }) {
    console.log(JSON.stringify({ request }));

    if (
      [
        "eth_sign",
        //"eth_signTransaction",
        // "eth_call",
      ].includes(request.method)
    ) {
      throw new ProviderRpcError("Unauthorized", 4100);
    }
    if (["eth_accounts"].includes(request.method)) {
      const addr = `0x${this.account.getAddress()}`;

      const result = [addr];
      console.log(JSON.stringify({ request, result }));
      return result;
    }

    if (["eth_sendTransaction"].includes(request.method)) {
      const [txData] = request.params ?? [];
      if (!txData.gasLimit) {
        txData.gasLimit = 90000;
      }

      if (!txData.maxFeePerGas) {
        txData.maxFeePerGas = 875000000;
      }

      const tx = FeeMarketEIP1559Transaction.fromTxData(txData);
      const signedTx = this.account.sign(tx);
      const txHex = "0x" + signedTx.serialize().toString("hex");

      const res = await this._executeRequest({
        method: "eth_sendRawTransaction",
        params: [txHex],
      });
      this.account.incrementNonce();
      return res;
    }
    const result = await this._executeRequest(request);
    console.log(JSON.stringify({ request, result }));
    return result;
  }
}
