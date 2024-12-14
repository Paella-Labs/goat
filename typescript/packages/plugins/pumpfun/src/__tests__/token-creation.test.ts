import { describe, it, expect } from 'vitest';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TEST_WALLET_KEY } from './wallet';
import { createPumpToken } from '../token';

describe('PumpFun Token Creation', () => {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = Keypair.fromSecretKey(TEST_WALLET_KEY);
  const PUMP_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEYfBH1');
  const DECIMALS = 6;

  it('should create a token with correct parameters', async () => {
    const tokenName = 'Test Token';
    const tokenSymbol = 'TEST';
    const initialLiquidity = 0.1;

    // Check wallet balance first
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('Wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
    expect(balance).toBeGreaterThan(0.1 * LAMPORTS_PER_SOL);

    try {
      const result = await createPumpToken({
        connection,
        wallet,
        name: tokenName,
        symbol: tokenSymbol,
        initialLiquidity: initialLiquidity * LAMPORTS_PER_SOL
      });

      console.log('Token creation result:', {
        address: result.tokenAddress.toString(),
        bondingCurve: result.bondingCurveAccount.toString()
      });

      // Verify token address ends with 'pump'
      expect(result.tokenAddress.toString().toLowerCase()).toMatch(/pump$/);

      // Verify bonding curve account exists
      const bondingCurveAccount = await connection.getAccountInfo(result.bondingCurveAccount);
      expect(bondingCurveAccount).not.toBeNull();

      // Verify token decimals
      const tokenAccountInfo = await connection.getAccountInfo(result.tokenAddress);
      expect(tokenAccountInfo).not.toBeNull();
      // Token account data structure: [authority(32), mint(32), decimals(1), ...]
      const decimals = tokenAccountInfo?.data[64];
      expect(decimals).toBe(DECIMALS);

      // Verify minimal liquidity deposit
      const curveBalance = await connection.getBalance(result.bondingCurveAccount);
      expect(curveBalance).toBeGreaterThanOrEqual(initialLiquidity * LAMPORTS_PER_SOL);

      console.log('Token created successfully:', {
        address: result.tokenAddress.toString(),
        bondingCurve: result.bondingCurveAccount.toString(),
        liquidity: curveBalance / LAMPORTS_PER_SOL,
        decimals
      });
    } catch (error) {
      console.error('Token creation failed:', error);
      throw error;
    }
  }, 30000); // 30 second timeout
});
