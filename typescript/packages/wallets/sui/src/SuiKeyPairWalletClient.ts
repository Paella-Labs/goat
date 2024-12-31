import { type OwnedObjectRef, SuiClient, type SuiObjectRef } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { toB64 } from "@mysten/sui.js/utils";
import { SuiWalletClient } from "./SuiWalletClient";
import type { SuiQuery, SuiQueryResponse, SuiTransaction, SuiTransactionResponse } from "./types";

export class SuiKeyPairWalletClient extends SuiWalletClient {
    private suiAccount: Ed25519Keypair;

    constructor(params: { client: SuiClient; privateKey: string }) {
        super({ client: params.client });
        this.suiAccount = Ed25519Keypair.fromSecretKey(Buffer.from(params.privateKey, "hex"));
    }

    getAddress(): string {
        return this.suiAccount.toSuiAddress();
    }

    async signMessage(message: string): Promise<{ signature: string }> {
        const messageBytes = new TextEncoder().encode(message);
        const signedData = await this.suiAccount.signPersonalMessage(messageBytes);
        // Convert the signature to base64 string
        return {
            signature: signedData.toString(),
        };
    }

    async sendTransaction({ transaction }: SuiTransaction): Promise<SuiTransactionResponse> {
        const response = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: transaction,
            signer: this.suiAccount,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });

        return {
            hash: response.digest,
        };
    }

    async read(query: SuiQuery): Promise<SuiQueryResponse> {
        switch (query.type) {
            case "getObject": {
                const response = await this.client.getObject({
                    id: query.objectId,
                    options: query.options,
                });
                return { result: response };
            }
            case "getBalance": {
                const response = await this.client.getBalance({
                    owner: query.owner,
                    coinType: query.coinType,
                });
                return { result: response };
            }
            default:
                throw new Error(`Unsupported query type: ${(query as { type: string }).type}`);
        }
    }
}

export const sui = (params: { client: SuiClient; privateKey: string }) => {
    return new SuiKeyPairWalletClient(params);
};
