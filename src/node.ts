import { runHardhatInstance } from "./utils.js";
async function main() {
  await runHardhatInstance();
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
