import { Chain, PluginBase, ToolBase, createTool } from "@goat-sdk/core";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { z } from "zod";
import { SuiWalletClient } from "./SuiWalletClient";

export class SendSUIPlugin extends PluginBase<SuiWalletClient> {
    constructor() {
        super("sendSUI", []);
    }

    supportsChain = (chain: Chain) => chain.type === "sui";

    getTools(walletClient: SuiWalletClient): ToolBase[] {
        const sendTool = createTool(
            {
                name: "send_sui",
                description: "Send SUI to an address",
                parameters: sendSUIParametersSchema,
            },
            async (parameters) => sendSUIMethod(walletClient, parameters),
        );
        return [sendTool];
    }
}

const sendSUIParametersSchema = z.object({
    to: z.string().describe("The address to send SUI to"),
    amount: z.string().describe("The amount of SUI to send"),
});

async function sendSUIMethod(walletClient: SuiWalletClient, parameters: z.infer<typeof sendSUIParametersSchema>) {
    try {
        const tx = new TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(parameters.amount)]);
        tx.transferObjects([coin], tx.pure(parameters.to));

        const response = await walletClient.sendTransaction({
            transaction: tx,
        });

        return {
            hash: response.hash,
        };
    } catch (error) {
        throw new Error(`Failed to send SUI: ${error}`);
    }
}

export const sendSUI = () => new SendSUIPlugin();
