import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetTrendingCoinsParameters extends createToolParameters(
    z.object({
        include_platform: z
            .boolean()
            .optional()
            .default(false)
            .describe("Include platform contract addresses (e.g., ETH, BSC) in response"),
    }).strict(),
) {}

export class GetCoinPriceParameters extends createToolParameters(
    z.object({
        ids: z.string().describe("The ID of the coin on CoinGecko (e.g., 'bitcoin', 'ethereum')"),
        vs_currencies: z
            .string()
            .default("usd")
            .describe("The target currency to get price in (e.g., 'usd', 'eur', 'jpy')"),
        include_market_cap: z.boolean().optional().default(false).describe("Include market cap data in the response"),
        include_24hr_vol: z.boolean().optional().default(false).describe("Include 24 hour volume data in the response"),
        include_24hr_change: z
            .boolean()
            .optional()
            .default(false)
            .describe("Include 24 hour price change data in the response"),
        include_last_updated_at: z
            .boolean()
            .optional()
            .default(false)
            .describe("Include last updated timestamp in the response"),
    }).strict(),
) {}

export class SearchCoinsParameters extends createToolParameters(
    z.object({
        query: z.string().describe("Search query to find coins, categories and markets"),
        exact_match: z.boolean().optional().default(false).describe("Only return exact matches for the search query"),
    }).strict(),
) {}

export class GetTokenPriceParameters extends createToolParameters(
    z.object({
        platform_id: z.string().describe("Asset platform's id (e.g., 'ethereum')"),
        token_addresses: z.string().describe("The contract address of tokens (comma-separated for multiple)"),
        vs_currencies: z.string().describe("Target currencies of coins (comma-separated, e.g., 'usd,eur')"),
        include_market_cap: z.boolean().optional().default(false).describe("Include market cap data"),
        include_24hr_vol: z.boolean().optional().default(false).describe("Include 24hr volume"),
        include_24hr_change: z.boolean().optional().default(false).describe("Include 24hr price change"),
        include_last_updated_at: z.boolean().optional().default(false).describe("Include last updated timestamp"),
        precision: z
            .union([z.literal("full"), z.number().min(0).max(18)])
            .optional()
            .describe("Decimal places in currency price value"),
    }).strict(),
) {}

export class GetSupportedCoinsParameters extends createToolParameters(
    z.object({
        include_platform: z.boolean().optional().default(false).describe("Include platform contract addresses"),
    }).strict(),
) {}

export class GetHistoricalDataParameters extends createToolParameters(
    z.object({
        coin_id: z.string().describe("Pass the coin id (e.g., 'bitcoin')"),
        date: z.string().describe("The date of data snapshot in dd-mm-yyyy format"),
        localization: z
            .boolean()
            .optional()
            .default(true)
            .describe("Set false to exclude localized languages in response"),
    }).strict(),
) {}

export class GetCoinOhlcParameters extends createToolParameters(
    z.object({
        coin_id: z.string().describe("Pass the coin id (e.g., 'bitcoin')"),
        vs_currency: z.string().describe("The target currency of market data (e.g., 'usd')"),
        days: z
            .union([
                z.literal("1"),
                z.literal("7"),
                z.literal("14"),
                z.literal("30"),
                z.literal("90"),
                z.literal("180"),
                z.literal("365"),
                z.literal("max"),
            ])
            .describe("Data up to number of days ago (1/7/14/30/90/180/365/max)"),
    }).strict(),
) {}
