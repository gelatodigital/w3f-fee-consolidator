# Web3 Function Automated Fee Consolidation

This project accrues various fee tokens and swaps them for a single user-specified token using an aggregator (1inch) once a certain threshold is exceeded.
Tokens are accrued in a user's [`dedicatedMsgSender`](https://fund-proxy.web.app/) proxy which forwards calls from the Web3 Function in order to swap tokens.
This can be adapted to instead swap fee tokens accrued in a Smart Contract or Safe (using a Safe module).
Since computation is performed entirely off-chain by a Web3 Function, no contract deployment is necessary.

> **Note**
> Web3 Functions are currently in private beta.  
> In order to get access, please reach out to us [here](https://form.typeform.com/to/RrEiARiI)

## Hardhat Task
The example implements a [consolidate](https://github.com/gelatodigital/w3f-fee-consolidator/blob/main/tasks/consolidate.ts) hardhat task for deployment from the CLI.  
Arguments are as following:
- `in` List of fee tokens to swap, separated by commas
- `out` Unified output token to swap input tokens for
- `amount` Minimum output amount for a swap denominated in output tokens

[See Quick Start](#quick-start)

## Prerequisites
- In order to use 1inch, you must obtain a [1inch API key](https://portal.1inch.dev/)  
- In order to compensate Gelato Nodes for running Web3 functions and executing transactions on your behalf, you must have funds deposited on [1Balance](https://beta.app.gelato.network/balance)
## Quick Start

> **Warning**  
> Code is not audited by a third party. Please use at your own discretion.

1. Install dependencies
   ```
   yarn install
   ```
2. Compile smart contracts
   ```
   yarn run hardhat compile
   ```
3. Edit ``.env``
   ```
   cp .env.example .env
   ```
5. Create consolidate task
   ```
   yarn hardhat consolidate --in [addresses] --out [address] --amount [value] --network [network]
   ```
