import { AutomateSDK, Web3Function } from "@gelatonetwork/automate-sdk";
import { task } from "hardhat/config";
import "dotenv";

task("consolidate", "Automatically swap accrued tokens")
  .addParam("in", "list of tokens to swap, separated by commas")
  .addParam("out", "unified token to swap input tokens for")
  .addParam("amount", "minimum output amount denominated in output tokens")
  .setAction(async (args, { ethers, w3f }) => {
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) throw new Error("Consolidate: missing 1inch API key in .env");

    const tokensIn = (args.in as string).split(" ");
    for (const token of tokensIn) {
      if (!ethers.utils.isAddress(token))
        throw new Error("Consolidate: invalid input token address");
    }

    const tokenOut = args.out as string;
    if (!ethers.utils.isAddress(tokenOut))
      throw new Error("Consolidate: invalid output token address");

    const amount = BigInt(args.amount);
    if (!amount) throw new Error("Consolidate: invalid amount");

    // deploy W3F to IPFS
    console.log("Deploying W3F to IPFS.");

    const consolidateW3f = w3f.get("consolidate");
    const cid = await consolidateW3f.deploy();

    console.log(`Deployed W3F hash ${cid}.`);

    // create W3F task
    console.log("Creating W3F task.");

    const [deployer] = await ethers.getSigners();
    const chainId = await deployer.getChainId();

    const automate = new AutomateSDK(chainId, deployer);
    const web3Function = new Web3Function(chainId, deployer);
    const proxy = await automate.getDedicatedMsgSender();

    const { taskId, tx } = await automate.createBatchExecTask({
      name: "Automated Fee Consolidation",
      web3FunctionHash: cid,
      web3FunctionArgs: {
        proxyAddress: proxy.address,
        tokenInAddresses: tokensIn,
        tokenOutAddress: tokenOut,
        minOutAmount: amount.toString(),
      },
    });

    await web3Function.secrets.set({ key: apiKey }, taskId);
    await tx.wait();

    console.log(
      `Created consolidate task: https://beta.app.gelato.network/task/${taskId}?chainId=${chainId}`
    );
  });
