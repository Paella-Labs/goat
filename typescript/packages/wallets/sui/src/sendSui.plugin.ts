import { z } from "zod";
import { Chain, PluginBase, createTool, Tool } from "@goat-sdk/core";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import type { SuiWalletClient } from "./SuiWalletClient";

const sendSUIParametersSchema = z.object({
    recipient: z.string().describe("The recipient's address"),
    amount: z.string().describe("The amount of SUI to send (in decimals)"),
}) as z.ZodType<{
    recipient: string;
    amount: string;
}>;

async function sendSUIMethod(
    walletClient: SuiWalletClient,
    parameters: z.infer<typeof sendSUIParametersSchema>,
): Promise<{ hash: string; digest?: string }> {
    try {
        const tx = new TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(parameters.amount)]);
        tx.transferObjects([coin], tx.pure(parameters.recipient));

        const response = await walletClient.sendTransaction({
            transaction: tx,
        });

        return {
            hash: response.hash,
            digest: response.digest,
        };
    } catch (error) {
        throw new Error(`Failed to send SUI: ${error}`);
    }
}

export class SendSUIPlugin extends PluginBase<SuiWalletClient> {
    constructor() {
        super("sendSUI", []);
    }

    supportsChain(chain: Chain) {
        return chain.type === "sui";
    }

    getTools(walletClient: SuiWalletClient): ReturnType<typeof createTool>[] {
        const sendTool = createTool(
            {
                name: "send_sui",
                description: "Send SUI to an address",
                parameters: sendSUIParametersSchema,
            },
            (parameters: z.infer<typeof sendSUIParametersSchema>) =>
                sendSUIMethod(walletClient, parameters),
        );

        return [sendTool];
    }
}

export const sendSUI = () => new SendSUIPlugin();
