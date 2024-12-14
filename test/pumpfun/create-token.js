import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';

const PUMP_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEYfBH1');

async function createMinimalPumpToken() {
    // Use minimal SOL for testing:
    // - 0.1 SOL initial liquidity (instead of 2 SOL)
    // - 0.02 SOL creation fee
    // - ~0.003 SOL transaction fees
    // Total: ~0.123 SOL

    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

    // Use the funded wallet's private key
    const privateKey = [192,243,211,108,49,79,123,157,251,126,76,89,231,212,45,227,29,126,253,50,20,13,153,159,84,202,227,101,191,110,31,182,124,94,156,65,86,251,159,0,63,3,80,146,73,64,79,210,51,246,197,126,224,37,149,240,98,2,60,41,233,168,238,66];
    const wallet = Keypair.fromSecretKey(new Uint8Array(privateKey));
    console.log('Checking wallet:', wallet.publicKey.toString());

    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('Current balance:', balance / 1e9, 'SOL');

    if (balance < 0.123 * 1e9) {
        console.log('Insufficient balance. Please fund the wallet with at least 0.123 SOL');
        return;
    }
}

createMinimalPumpToken().catch(console.error);
