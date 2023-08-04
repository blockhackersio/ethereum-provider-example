import axios from "axios";

function formatEth(str) {
  return (parseInt(str) / 1e18).toFixed(2);
}

async function main() {
  const res = await axios.post("http://127.0.0.1:8545", {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: ["0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"],
    id: 1,
  });
  console.log(`${formatEth(res.data.result)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
