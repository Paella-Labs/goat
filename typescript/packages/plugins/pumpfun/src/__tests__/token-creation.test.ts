import { describe, it, expect, vi } from 'vitest';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TEST_WALLET_KEY } from './wallet';
import { createPumpToken } from '../token';
import type { SolanaWalletClient, SolanaReadRequest, SolanaReadResult } from '@goat-sdk/core';
import { pumpfun } from '../index';

describe('PumpFun Plugin', () => {
  // Mock connection
  const mockConnection = {
    getBalance: vi.fn().mockResolvedValue(1 * LAMPORTS_PER_SOL),
    getLatestBlockhash: vi.fn().mockResolvedValue({ blockhash: 'mock-blockhash' }),
    sendTransaction: vi.fn().mockResolvedValue('mock-signature'),
    confirmTransaction: vi.fn().mockResolvedValue(true),
    getAccountInfo: vi.fn().mockResolvedValue({ data: Buffer.from('mock-data') })
  } as unknown as Connection;

  const keypair = Keypair.fromSecretKey(TEST_WALLET_KEY);

  // Create a mock SolanaWalletClient
  const mockWalletClient: SolanaWalletClient = {
    getAddress: () => keypair.publicKey.toString(),
    getChain: () => ({ type: 'solana', network: 'devnet' }),
    signMessage: async () => ({ signature: 'mock-signature' }),
    balanceOf: async () => ({
      decimals: 9,
      symbol: 'SOL',
      name: 'Solana',
      value: BigInt(1 * LAMPORTS_PER_SOL)
    }),
    read: async (): Promise<SolanaReadResult> => ({
      value: null
    }),
    sendTransaction: async ({ instructions }) => {
      return { hash: 'mock-tx-hash' };
    }
  };

  describe('Plugin Interface', () => {
    const plugin = pumpfun();

    it('should have correct name', () => {
      expect(plugin.name).toBe('pumpfun');
    });

    it('should support only Solana chain', () => {
      expect(plugin.supportsChain({ type: 'solana' })).toBe(true);
      expect(plugin.supportsChain({ type: 'evm' })).toBe(false);
    });

    it('should not support smart wallets', () => {
      expect(plugin.supportsSmartWallets()).toBe(false);
    });

    it('should provide createPumpToken tool', async () => {
      const tools = await plugin.getTools(mockWalletClient);
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('createPumpToken');
      expect(tools[0].description).toContain('{{tool}}');
      expect(tools[0].parameters).toBeDefined();
    });
  });

  describe('Token Creation', () => {
    it('should create a token with correct parameters', async () => {
      const tokenName = 'Test Token';
      const tokenSymbol = 'TEST';
      const initialLiquidity = 0.1;

      const result = await createPumpToken(
        mockWalletClient,
        mockConnection,
        {
          name: tokenName,
          symbol: tokenSymbol,
          initialLiquidity: initialLiquidity * LAMPORTS_PER_SOL
        }
      );

      // Verify token address ends with 'pump'
      expect(result.tokenAddress.toString().toLowerCase()).toMatch(/pump$/);

      // Verify transaction was sent
      expect(result.txHash).toBe('mock-tx-hash');

      // Verify bonding curve account was created
      expect(result.bondingCurveAccount).toBeInstanceOf(PublicKey);
    });

    it('should validate parameters correctly', async () => {
      const plugin = pumpfun();
      const tools = await plugin.getTools(mockWalletClient);
      const createTool = tools[0];

      // Test valid parameters
      const validParams = {
        name: 'Test Token',
        symbol: 'TEST',
        initialLiquidity: 0.1
      };
      await expect(createTool.method(validParams)).resolves.toBeDefined();

      // Test invalid parameters
      const invalidParams = {
        name: '',
        symbol: '',
        initialLiquidity: 0
      };
      await expect(createTool.parameters.parseAsync(invalidParams)).rejects.toBeDefined();
    });
  });
});
