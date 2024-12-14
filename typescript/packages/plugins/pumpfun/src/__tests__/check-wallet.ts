import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TEST_WALLET_KEY } from './wallet';

async function checkWallet() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = Keypair.fromSecretKey(TEST_WALLET_KEY);

  console.log('Wallet public key:', wallet.publicKey.toString());
  const balance = await connection.getBalance(wallet.publicKey);
  console.log('Wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
}

checkWallet().catch(console.error);
