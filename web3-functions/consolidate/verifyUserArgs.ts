import { Web3FunctionUserArgs } from "@gelatonetwork/web3-functions-sdk";
import { ethers } from "ethers";

interface IUserArgs {
  proxyAddress: string;
  tokenInAddresses: string[];
  tokenOutAddress: string;
  minOutAmount: bigint;
}

const verifyUserArgs = (args: Web3FunctionUserArgs): IUserArgs => {
  const proxyAddress = args.proxyAddress as string;
  if (!ethers.utils.isAddress(proxyAddress))
    throw new Error("verifyUserArgs: Invalid proxy address");

  const tokenInAddresses = args.tokenInAddresses as string[];
  if (tokenInAddresses.length == 0)
    throw new Error("verifyUserArgs: Missing tokenIn address");

  for (const token of tokenInAddresses) {
    if (!ethers.utils.isAddress(token))
      throw new Error("verifyUserArgs: Invalid tokenIn addresses");
  }

  const tokenOutAddress = args.tokenOutAddress as string;
  if (!ethers.utils.isAddress(tokenOutAddress))
    throw new Error("verifyUserArgs: Invalid tokenOut address");

  const minOutAmount = BigInt(args.minOutAmount as string);
  if (!minOutAmount) throw new Error("verifyUserArgs: Invalid minOutAmount");

  return {
    proxyAddress,
    tokenInAddresses,
    tokenOutAddress,
    minOutAmount,
  };
};

export default verifyUserArgs;
