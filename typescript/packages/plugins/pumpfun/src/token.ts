import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// Pump.fun program ID on Solana
const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEYfBH1');

// Token decimals must be 6 for pump.fun tokens
const TOKEN_DECIMALS = 6;

interface CreatePumpTokenParams {
  connection: Connection;
  wallet: Keypair;
  name: string;
  symbol: string;
  initialLiquidity: number;
}

interface CreatePumpTokenResult {
  tokenAddress: PublicKey;
  bondingCurveAccount: PublicKey;
}

export async function createPumpToken(params: CreatePumpTokenParams): Promise<CreatePumpTokenResult> {
  const { connection, wallet, name, symbol, initialLiquidity } = params;

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
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: bondingCurveAccount,
      lamports: initialLiquidity,
    })
  );

  // Send and confirm transaction
  const signature = await connection.sendTransaction(tx, [wallet]);
  await connection.confirmTransaction(signature, 'confirmed');

  return {
    tokenAddress: mintKeypair.publicKey,
    bondingCurveAccount,
  };
}
