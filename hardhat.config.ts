import { HardhatUserConfig } from "hardhat/config";
import "@gelatonetwork/web3-functions-sdk/hardhat-plugin";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import "./tasks/consolidate";
import "@typechain/hardhat";
import "hardhat-deploy";
import "dotenv";

const RPC_PROVIDER = process.env.RPC_PROVIDER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

import assert from "assert";
assert.ok(RPC_PROVIDER, "Missing RPC provider in .env");

const config: HardhatUserConfig = {
  w3f: {
    rootDir: "./web3-functions",
    debug: false,
    networks: ["polygon"],
  },
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: { enabled: true },
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: RPC_PROVIDER,
      },
      chainId: 137,
    },
    polygon: {
      chainId: 137,
      url: RPC_PROVIDER,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

export default config;
