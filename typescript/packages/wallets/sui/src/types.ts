import { z } from "zod";
import { type TransactionBlock } from "@mysten/sui.js/transactions";
import { type SuiObjectResponse, type CoinBalance } from "@mysten/sui.js/client";

export type SuiTransaction = {
    transaction: TransactionBlock;
};

export type SuiTransactionResponse = {
    hash: string;
    digest: string;
    events?: Array<{
        id: string;
        packageId: string;
        transactionModule: string;
        sender: string;
        type: string;
        parsedJson?: Record<string, unknown>;
        bcs?: string;
        timestampMs?: number;
    }>;
    effects?: {
        status: { status: string };
        gasUsed: { computationCost: string; storageCost: string; storageRebate: string };
        transactionDigest: string;
        created?: Array<{ owner: string; reference: { objectId: string; version: string; digest: string } }>;
        mutated?: Array<{ owner: string; reference: { objectId: string; version: string; digest: string } }>;
        deleted?: Array<{ owner: string; reference: { objectId: string; version: string; digest: string } }>;
    };
};

export type SuiQuery = {
    type: "getObject";
    objectId: string;
    options?: { showContent?: boolean; showDisplay?: boolean };
} | {
    type: "getBalance";
    owner: string;
    coinType?: string;
};

export type SuiQueryResponse = {
    result: SuiObjectResponse | CoinBalance;
};
