import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import type { SolanaWalletClient } from '@goat-sdk/core';

// Pump.fun program ID on Solana
const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEYfBH1');

// Token decimals must be 6 for pump.fun tokens
const TOKEN_DECIMALS = 6;

export interface CreatePumpTokenParams {
  name: string;
  symbol: string;
  initialLiquidity: number;
}

export interface CreatePumpTokenResult {
  tokenAddress: PublicKey;
  bondingCurveAccount: PublicKey;
  txHash: string;
}

export async function createPumpToken(
  walletClient: SolanaWalletClient,
  connection: Connection,
  params: CreatePumpTokenParams
): Promise<CreatePumpTokenResult> {
  const { name, symbol, initialLiquidity } = params;
  const walletAddress = walletClient.getAddress();

  // Generate mint keypair that ends with 'pump'
  let mintKeypair: Keypair;
  do {
    mintKeypair = Keypair.generate();
  } while (!mintKeypair.publicKey.toString().toLowerCase().endsWith('pump'));

  // Derive bonding curve account
  const [bondingCurveAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('bonding_curve'), mintKeypair.publicKey.toBuffer()],
    PUMP_FUN_PROGRAM_ID
  );

  // Create transaction for initial liquidity deposit
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: new PublicKey(walletAddress),
    toPubkey: bondingCurveAccount,
    lamports: initialLiquidity,
  });

  // Send transaction using wallet client
  const txResult = await walletClient.sendTransaction({
    instructions: [transferInstruction],
  });

  return {
    tokenAddress: mintKeypair.publicKey,
    bondingCurveAccount,
    txHash: txResult.hash,
  };
}
