import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { Connection, Keypair } from "@solana/web3.js";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { sendSOL } from "@goat-sdk/core";
import { pumpFunPlugin } from "@goat-sdk/plugin-pump-fun";
import { solana } from "@goat-sdk/wallet-solana";

require("dotenv").config();

// Initialize Solana connection and wallet
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
const keypair = Keypair.fromSecretKey(
    Buffer.from(process.env.WALLET_PRIVATE_KEY as string, 'base64')
);

(async () => {
    const tools = await getOnChainTools({
        wallet: solana({ connection, keypair }),
        plugins: [
            sendSOL(),
            pumpFunPlugin(),
        ],
    });

    const result = await generateText({
        model: openai("gpt-4-turbo"),
        tools: tools,
        maxSteps: 5,
        prompt: "Create a new pump.fun token called 'ExampleToken' and show me the transaction details.",
    });

    console.log(result.text);
})();
