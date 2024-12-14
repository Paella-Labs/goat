import {
    Keypair,
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {
    SolanaWalletClient,
    SolanaTransaction,
    SolanaTransactionResult,
    SolanaReadRequest,
    SolanaReadResult,
    Chain,
    Balance,
    Signature,
} from '@goat-sdk/core';
import * as nacl from 'tweetnacl';

export class TestSolanaWallet implements SolanaWalletClient {
    public readonly connection: Connection;
    public readonly publicKey: PublicKey;
    private readonly keypair: Keypair;

    constructor({ cluster, keypair }: { cluster: string; keypair: Keypair }) {
        this.connection = new Connection(`https://api.${cluster}.solana.com`);
        this.keypair = keypair;
        this.publicKey = keypair.publicKey;
    }

    async sendTransaction(transaction: SolanaTransaction): Promise<SolanaTransactionResult> {
        const tx = new Transaction();
        tx.add(...transaction.instructions);

        // Get recent blockhash
        const { blockhash } = await this.connection.getRecentBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = this.publicKey;

        // Sign and send
        const signature = await this.connection.sendTransaction(tx, [this.keypair]);
        await this.connection.confirmTransaction(signature);

        return { hash: signature };
    }

    getAddress(): string {
        return this.publicKey.toString();
    }

    getChain(): Chain {
        return { type: 'solana' };
    }

    async signMessage(message: string): Promise<Signature> {
        const messageBytes = Buffer.from(message);
        const signData = this.keypair.secretKey.slice(0, 32);
        const signature = nacl.sign.detached(messageBytes, signData);
        return { signature: Buffer.from(signature).toString('base64') };
    }

    async balanceOf(address: string): Promise<Balance> {
        const balance = await this.connection.getBalance(new PublicKey(address));
        return {
            decimals: 9,
            symbol: 'SOL',
            name: 'Solana',
            value: BigInt(balance),
        };
    }

    async read(request: SolanaReadRequest): Promise<SolanaReadResult> {
        const accountInfo = await this.connection.getAccountInfo(
            new PublicKey(request.accountAddress)
        );
        return { value: accountInfo?.data };
    }
}
