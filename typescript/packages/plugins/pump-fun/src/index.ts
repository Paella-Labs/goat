import { Chain } from "@goat-sdk/core";
import type { Plugin, WalletClient } from "@goat-sdk/core";
import { getTools } from "./tools";

export function pumpFunPlugin(): Plugin<WalletClient> {
    return {
        name: "pump-fun",
        supportsChain: (chain: Chain) => chain.type === "solana",
        supportsSmartWallets: () => false,
        getTools,
    };
}
