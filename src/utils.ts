import { ChildProcess, spawn } from "child_process";
import axios from "axios";

export type HardHatService = {
  isRunning: () => boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function createHardhatService(): HardHatService {
  let cp: ChildProcess | null = null;

  async function start() {
    if (isRunning()) {
      await stop();
    }

    cp = spawn("pnpm", ["hardhat", "node"]);
    while (true) {
      try {
        await axios.get("http://127.0.0.1:8543");
        return;
      } catch (err) {
        continue;
      }
    }
  }

  async function stop() {
    if (!cp) return;
    cp.kill();
    while (true) {
      if (cp.killed) {
        break;
      }
      await sleep(100);
    }
    cp = null;
  }

  function isRunning() {
    return !!cp;
  }
  return { start, stop, isRunning };
}
