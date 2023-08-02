import { ethers } from "ethers";
import { ONEINCH_API } from "./constants";
import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import verifyUserArgs from "./verifyUserArgs";
import ERC20Abi from "./abi/ERC20.json";
import ky from "ky";

interface ISwap {
  toAmount: string;
  tx: {
    to: string;
    data: string;
  };
}

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, multiChainProvider } = context;
  const { proxyAddress, tokenInAddresses, tokenOutAddress, minOutAmount } =
    verifyUserArgs(userArgs);

  const provider = multiChainProvider.default();
  const { chainId } = await provider.getNetwork();

  const indexStr = await context.storage.get("index");
  const index = indexStr !== undefined ? parseInt(indexStr) : 0;

  const nextindex = (index + 1) % tokenInAddresses.length;
  await context.storage.set("index", nextindex.toString());

  const tokenIn = new ethers.Contract(
    tokenInAddresses[index],
    ERC20Abi,
    provider
  );

  const amountIn = await tokenIn.balanceOf(proxyAddress);
  if (amountIn <= 0) return { canExec: false, message: "No tokens available" };

  const swapParams = {
    src: tokenIn.address,
    dst: tokenOutAddress,
    amount: amountIn.toString(),
    from: proxyAddress,
    slippage: "1",
    disableEstimate: "true",
  };

  const queryParams = new URLSearchParams(swapParams).toString();
  const query = `${ONEINCH_API}/${chainId}/swap?${queryParams}`;

  const key = await context.secrets.get("key");
  const swap: ISwap = await ky
    .get(query, { headers: { Authorization: `Bearer ${key}` } })
    .json();

  if (BigInt(swap.toAmount) < minOutAmount)
    return { canExec: false, message: "Not eligible for swap" };

  const approve = await tokenIn.populateTransaction.approve(
    swap.tx.to,
    amountIn
  );

  if (!approve.to || !approve.data)
    return { canExec: false, message: "Invalid transaction" };

  return {
    canExec: true,
    callData: [
      { to: approve.to, data: approve.data },
      { to: swap.tx.to, data: swap.tx.data },
    ],
  };
});
