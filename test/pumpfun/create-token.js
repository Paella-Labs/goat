import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const PUMP_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEYfBH1');

async function createMinimalPumpToken() {
    // Use minimal SOL for testing:
    // - 0.1 SOL initial liquidity (instead of 2 SOL)
    // - 0.02 SOL creation fee
    // - ~0.003 SOL transaction fees
    // Total: ~0.123 SOL

    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const wallet = Keypair.generate();
    console.log('Wallet address for funding:', wallet.publicKey.toString());

    // Save private key for later use after funding
    console.log('Please save this private key securely (for testing only):');
    console.log(JSON.stringify(Array.from(wallet.secretKey)));

    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('Current balance:', balance / 1e9, 'SOL');

    if (balance < 0.123 * 1e9) {
        console.log('Insufficient balance. Please fund the wallet with at least 0.123 SOL');
        return;
    }
}

createMinimalPumpToken().catch(console.error);
