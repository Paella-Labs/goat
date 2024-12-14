import { describe, it, expect } from 'vitest';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TEST_WALLET_KEY } from './wallet';
import { createPumpToken } from '../token';

describe('PumpFun Token Creation', () => {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = Keypair.fromSecretKey(TEST_WALLET_KEY);

  it('should create a token with correct parameters', async () => {
    const tokenName = 'Test Token';
    const tokenSymbol = 'TEST';
    const initialLiquidity = 0.1;

    const result = await createPumpToken({
      connection,
      wallet,
      name: tokenName,
      symbol: tokenSymbol,
      initialLiquidity: initialLiquidity * LAMPORTS_PER_SOL
    });

    // Verify token address ends with 'pump'
    expect(result.tokenAddress.toString().toLowerCase()).toMatch(/pump$/);

    // Verify bonding curve account exists
    const bondingCurveAccount = await connection.getAccountInfo(result.bondingCurveAccount);
    expect(bondingCurveAccount).not.toBeNull();

    // Verify minimal liquidity deposit
    const balance = await connection.getBalance(result.bondingCurveAccount);
    expect(balance).toBeGreaterThanOrEqual(initialLiquidity * LAMPORTS_PER_SOL);

    console.log('Token created successfully:', {
      address: result.tokenAddress.toString(),
      bondingCurve: result.bondingCurveAccount.toString(),
      liquidity: balance / LAMPORTS_PER_SOL
    });
  });
});
