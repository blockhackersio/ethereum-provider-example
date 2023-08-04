import * as ethers from "ethers";
import axios from "axios";

class ProviderRpcError extends Error {
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
    public host = "http://127.0.0.1:8545",
    private id = 0,
    public isMetaMask = true
  ) {}

  private getId() {
    return ++this.id;
  }

  async request(request: { method: string; params?: Array<any> }) {
    if (
      [
        "eth_sign",
        "eth_signTransaction",
        "eth_sendTransaction",
        "eth_call",
      ].includes(request.method)
    ) {
      throw new ProviderRpcError("Unauthorized", 4100);
    }

    const res = await axios.post(this.host, {
      jsonrpc: "2.0",
      method: request.method,
      params: request.params,
      id: this.getId(),
    });

    return res.data.result;
  }
}
