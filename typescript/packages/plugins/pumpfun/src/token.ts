import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import type { SolanaWalletClient } from '@goat-sdk/core';

// Program IDs
const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// Token distribution constants (from example transaction)
const TOKEN_DISTRIBUTION = {
  LIQUIDITY_POOL: 965_387_096.774194,
  BONDING_CURVE: 34_612_903.225806,
  TOTAL: 1_000_000_000,
};

// Token decimals must be 6 for pump.fun tokens
const TOKEN_DECIMALS = 6;

// Initial liquidity requirement (from example transaction)
const MIN_INITIAL_LIQUIDITY_SOL = 1;
const LAMPORTS_PER_SOL = 1_000_000_000;

export interface CreatePumpTokenParams {
  name: string;
  symbol: string;
  uri: string;  // IPFS URI for token metadata
  initialLiquidity: number;  // in SOL, minimum 1 SOL
}

export interface CreatePumpTokenResult {
  tokenAddress: PublicKey;      // Mint account
  bondingCurveAccount: PublicKey;
  liquidityPoolAccount: PublicKey;
  metadataAccount: PublicKey;
  txHash: string;
  decimals: number;
  totalSupply: number;
}

export async function createPumpToken(
  walletClient: SolanaWalletClient,
  connection: Connection,
  params: CreatePumpTokenParams
): Promise<CreatePumpTokenResult> {
  const { name, symbol, uri, initialLiquidity } = params;
  const walletAddress = walletClient.getAddress();

  // Generate mint keypair that ends with 'pump'
  let mintKeypair: Keypair;
  do {
    mintKeypair = Keypair.generate();
  } while (!mintKeypair.publicKey.toString().toLowerCase().endsWith('pump'));

  // Calculate minimum rent for mint account
  const mintRent = await connection.getMinimumBalanceForRentExemption(82);

  // Create mint account
  const createMintAccountInstruction = SystemProgram.createAccount({
    fromPubkey: new PublicKey(walletAddress),
    newAccountPubkey: mintKeypair.publicKey,
    space: 82,
    lamports: mintRent,
    programId: TOKEN_PROGRAM_ID,
  });

  // Initialize mint instruction
  const initializeMintInstruction = new TransactionInstruction({
    keys: [
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.from([
      // Initialize mint instruction discriminator
      0x00,
      // Decimals
      TOKEN_DECIMALS,
      // Mint authority (wallet address)
      ...new PublicKey(walletAddress).toBytes(),
      // Freeze authority (null)
      0x00,
    ]),
  });

  // Derive metadata account
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer()
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  // Derive liquidity pool and bonding curve accounts
  const [liquidityPoolAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('liquidity_pool'),
      mintKeypair.publicKey.toBuffer(),
    ],
    PUMP_FUN_PROGRAM_ID
  );

  const [bondingCurveAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('bonding_curve'),
      mintKeypair.publicKey.toBuffer(),
    ],
    PUMP_FUN_PROGRAM_ID
  );


  // Create metadata instruction with proper data serialization
  const metadataData = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  // Serialize metadata instruction data according to Token Metadata Program spec
  const createMetadataInstructionData = Buffer.concat([
    // Instruction discriminator for CreateMetadataAccountV3
    Buffer.from([0x22, 0x35, 0x57, 0x8f, 0xd9, 0x44, 0x80, 0x4c]),
    // Data length prefix (u32 LE)
    Buffer.from(new Uint32Array([JSON.stringify(metadataData).length]).buffer),
    // Serialized metadata
    Buffer.from(JSON.stringify(metadataData)),
    // isMutable flag
    Buffer.from([0x00]),
    // Collection details (null)
    Buffer.from([0x00]),
  ]);

  const createMetadataInstruction = new TransactionInstruction({
    keys: [
      { pubkey: metadataAccount, isSigner: false, isWritable: true },
      { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: false },
      { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: false },
      { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: createMetadataInstructionData,
  });

  // Create associated token accounts for liquidity pool and bonding curve
  const createLiquidityPoolAccountInstruction = new TransactionInstruction({
    keys: [
      { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: true },
      { pubkey: liquidityPoolAccount, isSigner: false, isWritable: true },
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });

  const createBondingCurveAccountInstruction = new TransactionInstruction({
    keys: [
      { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: true },
      { pubkey: bondingCurveAccount, isSigner: false, isWritable: true },
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });

  // Create mint to instructions for token distribution
  const mintToLiquidityPoolInstruction = new TransactionInstruction({
    keys: [
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
      { pubkey: liquidityPoolAccount, isSigner: false, isWritable: true },
      { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.concat([
      Buffer.from([0x07]), // Mint to instruction discriminator
      Buffer.from(
        new BigUint64Array([
          BigInt(TOKEN_DISTRIBUTION.LIQUIDITY_POOL * Math.pow(10, TOKEN_DECIMALS))
        ]).buffer
      )
    ])
  });

  const mintToBondingCurveInstruction = new TransactionInstruction({
    keys: [
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
      { pubkey: bondingCurveAccount, isSigner: false, isWritable: true },
      { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.concat([
      Buffer.from([0x07]), // Mint to instruction discriminator
      Buffer.from(
        new BigUint64Array([
          BigInt(TOKEN_DISTRIBUTION.BONDING_CURVE * Math.pow(10, TOKEN_DECIMALS))
        ]).buffer
      )
    ])
  });

  // Create transaction for initial liquidity deposit
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: new PublicKey(walletAddress),
    toPubkey: bondingCurveAccount,
    lamports: initialLiquidity * LAMPORTS_PER_SOL,
  });

  // Create and sign transaction
  const transaction = new Transaction().add(
    createMintAccountInstruction,
    initializeMintInstruction,
    createMetadataInstruction,
    createLiquidityPoolAccountInstruction,
    createBondingCurveAccountInstruction,
    mintToLiquidityPoolInstruction,
    mintToBondingCurveInstruction,
    transferInstruction
  );
  transaction.feePayer = new PublicKey(walletAddress);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction.sign(mintKeypair);

  // Send pre-signed transaction using wallet client
  const txResult = await walletClient.sendTransaction({
    instructions: transaction.instructions,
  });

  return {
    tokenAddress: mintKeypair.publicKey,
    bondingCurveAccount,
    liquidityPoolAccount: bondingCurveAccount,
    metadataAccount,
    txHash: txResult.hash,
    decimals: TOKEN_DECIMALS,
    totalSupply: TOKEN_DISTRIBUTION.TOTAL,
  };
}
