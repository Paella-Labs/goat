import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createPumpToken } from '../token';
import { TestSolanaWallet } from './test-wallet';

async function main() {
    // Initialize wallet from private key
    const privateKey = 'rjozbjBmQ8uUbI0MZk10J3252cbkSIWlIAG5J1pJIIIgGBLMzpt1482k/JIob9V4rmx8MPQGQ9x7+kwSqb31kw==';
    const secretKey = Buffer.from(privateKey, 'base64');
    const keypair = Keypair.fromSecretKey(secretKey);

    // Create wallet client
    const wallet = new TestSolanaWallet({
        cluster: 'devnet',
        keypair,
    });

    console.log('Using wallet:', wallet.getAddress());

    // Verify wallet balance
    const balance = await wallet.balanceOf(wallet.getAddress());
    console.log('Wallet balance:', Number(balance.value) / LAMPORTS_PER_SOL, 'SOL');

    if (Number(balance.value) < 1.1 * LAMPORTS_PER_SOL) {
        throw new Error('Insufficient balance. Need at least 1.1 SOL for token creation and initial liquidity');
    }

    // Token parameters matching example transaction
    const tokenParams = {
        name: "Test Pump Token",
        symbol: "TPT",
        uri: "https://arweave.net/your-metadata-uri",
        initialLiquiditySOL: 1, // 1 SOL initial liquidity
    };

    try {
        // Create the token using our plugin
        const result = await createPumpToken(
            wallet,
            tokenParams
        );

        console.log('Token created successfully!');
        console.log('Mint address:', result.mintAddress.toString());
        console.log('Metadata address:', result.metadataAddress.toString());
        console.log('Liquidity pool address:', result.liquidityPoolAddress.toString());
        console.log('Bonding curve address:', result.bondingCurveAddress.toString());
        console.log('Transaction signature:', result.signature);
    } catch (error) {
        console.error('Failed to create token:', error);
        throw error;
    }
}

main().catch(console.error);
