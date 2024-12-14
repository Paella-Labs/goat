import { z } from 'zod';
import type { Plugin, SolanaWalletClient, Chain, Tool } from '@goat-sdk/core';
import { Connection } from '@solana/web3.js';
import { createPumpToken } from './token';

export interface CreatePumpTokenParams {
  name: string;
  symbol: string;
  initialLiquidity?: number;
}

export function pumpfun(): Plugin<SolanaWalletClient> {
  return {
    name: 'pumpfun',
    supportsChain: (chain: Chain) => chain.type === 'solana',
    supportsSmartWallets: () => false,
    getTools: async (walletClient: SolanaWalletClient): Promise<Tool[]> => {
      // Initialize connection inside getTools for proper lifecycle management
      const connection = new Connection('https://api.devnet.solana.com');

      return [
        {
          name: 'createPumpToken',
          description: 'This {{tool}} creates a new pump.fun token on Solana with a bonding curve. The token address will end with "pump".',
          parameters: z.object({
            name: z.string().describe('The name of the token'),
            symbol: z.string().describe('The symbol of the token'),
            initialLiquidity: z.number()
              .min(0.1)
              .default(0.1)
              .describe('Initial liquidity in SOL to deposit (minimum 0.1 SOL)')
          }),
          method: async (parameters: { name: string; symbol: string; initialLiquidity: number }) => {
            const result = await createPumpToken(
              walletClient,
              connection,
              {
                name: parameters.name,
                symbol: parameters.symbol,
                initialLiquidity: parameters.initialLiquidity * 1e9 // Convert to lamports
              }
            );

            return {
              tokenAddress: result.tokenAddress.toString(),
              bondingCurveAccount: result.bondingCurveAccount.toString(),
              txHash: result.txHash,
              initialLiquidity: parameters.initialLiquidity
            };
          }
        }
      ];
    }
  };
}
