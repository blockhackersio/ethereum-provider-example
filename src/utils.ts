import { spawn } from "child_process";
import axios from "axios";

export type HardHatService = {
  ready: () => Promise<void>;
  close: () => Promise<void>;
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
export function runHardhatInstance(): HardHatService {
  const cp = spawn("pnpm", ["hardhat", "node"]);

  async function ready() {
    while (true) {
      try {
        await axios.get("http://127.0.0.1:8545");
        return;
      } catch (err) {
        continue;
      }
    }
  }

  async function close() {
    cp.kill();
    while (true) {
      if (cp.killed) {
        break;
      }
      await sleep(100);
    }
  }
  return { close, ready };
}
