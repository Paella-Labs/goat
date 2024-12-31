import { type CoinBalance, type SuiObjectResponse } from "@mysten/sui.js/client";
import { type TransactionBlock } from "@mysten/sui.js/transactions";
import { z } from "zod";

export type SuiTransaction = {
    transaction: TransactionBlock;
};

export type SuiTransactionResponse = {
    hash: string;
};

export type SuiQuery =
    | {
          type: "getObject";
          objectId: string;
          options?: { showContent?: boolean; showDisplay?: boolean };
      }
    | {
          type: "getBalance";
          owner: string;
          coinType?: string;
      };

export type SuiQueryResponse = {
    result: SuiObjectResponse | CoinBalance;
};
