import { z } from "zod";
import { type TransactionBlock } from "@mysten/sui.js/transactions";

export type SuiTransaction = {
    transaction: TransactionBlock;
};

export type SuiTransactionResponse = {
    hash: string;
    digest?: string;
};

export type SuiQuery = {
    method: string;
    params: unknown[];
};

export type SuiQueryResponse = {
    result: unknown;
};
