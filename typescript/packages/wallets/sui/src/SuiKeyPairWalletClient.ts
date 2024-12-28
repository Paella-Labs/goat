import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient, type SuiObjectRef, type OwnedObjectRef } from "@mysten/sui.js/client";
import { toB64 } from "@mysten/sui.js/utils";
import { SerializedSignature } from "@mysten/sui.js/cryptography";
import { SuiWalletClient } from "./SuiWalletClient";
import type { SuiTransaction, SuiTransactionResponse, SuiQuery, SuiQueryResponse } from "./types";

export class SuiKeyPairWalletClient extends SuiWalletClient {
    private keypair: Ed25519Keypair;

    constructor(params: { client: SuiClient; privateKey: string }) {
        super({ client: params.client });
        this.keypair = Ed25519Keypair.fromSecretKey(Buffer.from(params.privateKey, "hex"));
    }

    getAddress(): string {
        return this.keypair.toSuiAddress();
    }

    async signMessage(message: string): Promise<{ signature: string }> {
        const messageBytes = new TextEncoder().encode(message);
        const signedData = await this.keypair.signPersonalMessage(messageBytes);
        // Convert the signature to base64 string
        return {
            signature: signedData.toString(),
        };
    }

    async sendTransaction(transaction: SuiTransaction): Promise<SuiTransactionResponse> {
        const response = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: transaction.transaction,
            signer: this.keypair,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });

        return {
            hash: response.digest,
            digest: response.digest,
            effects: response.effects ? {
                status: { status: response.effects.status.status },
                gasUsed: {
                    computationCost: response.effects.gasUsed.computationCost,
                    storageCost: response.effects.gasUsed.storageCost,
                    storageRebate: response.effects.gasUsed.storageRebate,
                },
                transactionDigest: response.effects.transactionDigest,
                created: response.effects.created?.map((item: OwnedObjectRef) => ({
                    owner: typeof item.owner === 'string' ? item.owner : 'Object',
                    reference: {
                        objectId: item.reference.objectId,
                        version: item.reference.version,
                        digest: item.reference.digest,
                    },
                })),
                mutated: response.effects.mutated?.map((item: OwnedObjectRef) => ({
                    owner: typeof item.owner === 'string' ? item.owner : 'Object',
                    reference: {
                        objectId: item.reference.objectId,
                        version: item.reference.version,
                        digest: item.reference.digest,
                    },
                })),
                deleted: response.effects.deleted?.map((item: SuiObjectRef) => ({
                    owner: "Deleted",
                    reference: {
                        objectId: item.objectId,
                        version: item.version,
                        digest: item.digest,
                    },
                })),
            } : undefined,
            events: response.events?.map(event => ({
                id: event.id.toString(),
                packageId: event.packageId,
                transactionModule: event.transactionModule,
                sender: event.sender,
                type: event.type,
                parsedJson: event.parsedJson as Record<string, unknown>,
                bcs: event.bcs,
                timestampMs: event.timestampMs ? Number(event.timestampMs) : undefined,
            })),
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

export const createSuiKeyPairWalletClient = (params: { client: SuiClient; privateKey: string }) => {
    return new SuiKeyPairWalletClient(params);
};
