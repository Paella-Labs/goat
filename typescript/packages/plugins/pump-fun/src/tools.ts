import type { Tool, WalletClient } from "@goat-sdk/core";
import {
    PublicKey,
    SystemProgram,
    Transaction,
    ComputeBudgetProgram,
    SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import { createPumpFunTokenParameters, type CreatePumpFunTokenParameters } from "./parameters";

const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uB...");
const BONDING_CURVE = new PublicKey("CGQWadvBuwG5MnY53UqR2TY2onouSYHRFjLzbs...");

export async function getTools(): Promise<Tool<WalletClient>[]> {
    return [
        {
            name: "createPumpFunToken",
            description: "Create a new pump.fun token on Solana",
            parameters: createPumpFunTokenParameters,
            execute: async (params: CreatePumpFunTokenParameters, wallet: WalletClient) => {
                const transaction = new Transaction();

                // Add compute budget instruction for complex operations
                transaction.add(
                    ComputeBudgetProgram.setComputeUnitLimit({
                        units: 400000
                    })
                );

                // Create token mint account
                const [tokenMint] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("pump_token"),
                        Buffer.from(params.tokenName),
                        wallet.publicKey.toBuffer()
                    ],
                    PUMP_FUN_PROGRAM
                );

                // Initialize pump.fun token with bonding curve
                const initializeIx = {
                    programId: PUMP_FUN_PROGRAM,
                    keys: [
                        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
                        { pubkey: tokenMint, isSigner: false, isWritable: true },
                        { pubkey: BONDING_CURVE, isSigner: false, isWritable: false },
                        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
                    ],
                    data: Buffer.from([
                        0, // Initialize instruction
                        ...Buffer.from(params.tokenName)
                    ])
                };

                transaction.add(initializeIx);

                // Sign and send transaction
                const signature = await wallet.sendTransaction(transaction);

                return {
                    signature,
                    tokenMint: tokenMint.toString()
                };
            },
        },
    ];
}
