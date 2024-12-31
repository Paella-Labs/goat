import { WalletClientBase } from "@goat-sdk/core";
import type { SuiClient } from "@mysten/sui.js/client";
import { formatUnits } from "viem";
import type { SuiQuery, SuiQueryResponse, SuiTransaction, SuiTransactionResponse } from "./types";

export type SuiWalletClientCtorParams = {
    client: SuiClient;
};

export abstract class SuiWalletClient extends WalletClientBase {
    protected client: SuiClient;

    constructor(params: SuiWalletClientCtorParams) {
        super();
        this.client = params.client;
    }

    getChain() {
        return {
            type: "sui",
        } as const;
    }

    getClient() {
        return this.client;
    }

    async balanceOf(address: string) {
        const balance = await this.client.getBalance({
            owner: address,
        });

        return {
            decimals: 9,
            symbol: "SUI",
            name: "Sui",
            value: formatUnits(BigInt(balance.totalBalance), 9),
            inBaseUnits: balance.totalBalance,
        };
    }

    abstract getAddress(): string;
    abstract signMessage(message: string): Promise<{ signature: string }>;
    abstract sendTransaction(transaction: SuiTransaction): Promise<SuiTransactionResponse>;
    abstract read(query: SuiQuery): Promise<SuiQueryResponse>;
}
