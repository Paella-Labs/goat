import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class GetTrendingCoinsParameters extends createToolParameters(
    z
        .object({
            limit: z.number().optional().describe("The number of trending coins to return. Defaults to all coins."),
            include_platform: z
                .boolean()
                .optional()
                .default(false)
                .describe("Include platform contract addresses (e.g., ETH, BSC) in response"),
        })
        .strict(),
) {}

export class GetCoinPriceParameters extends createToolParameters(
    z
        .object({
            coin_id: z.string().describe("The ID of the coin on CoinGecko (e.g., 'bitcoin', 'ethereum')"),
            vs_currency: z
                .string()
                .default("usd")
                .describe("The target currency to get price in (e.g., 'usd', 'eur', 'jpy')"),
            include_market_cap: z
                .boolean()
                .optional()
                .default(false)
                .describe("Include market cap data in the response"),
            include_24hr_vol: z
                .boolean()
                .optional()
                .default(false)
                .describe("Include 24 hour volume data in the response"),
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
        })
        .strict(),
) {}

export class SearchCoinsParameters extends createToolParameters(
    z
        .object({
            query: z.string().describe("The search query to find coins (e.g., 'bitcoin' or 'btc')"),
            exact_match: z
                .boolean()
                .optional()
                .default(false)
                .describe("Only return exact matches for the search query"),
            include_platform: z.boolean().optional().default(false).describe("Include platform contract addresses"),
        })
        .strict(),
) {}

export class GetTokenPriceParameters extends createToolParameters(
    z
        .object({
            id: z.string().describe("The asset platform id (e.g., 'ethereum')"),
            contract_addresses: z.string().describe("Token contract address"),
            vs_currencies: z.string().describe("Target currencies to get price in (comma-separated, e.g., 'usd,eur')"),
            include_market_cap: z.boolean().optional().default(false).describe("Include market cap data"),
            include_24hr_vol: z.boolean().optional().default(false).describe("Include 24hr volume"),
            include_24hr_change: z.boolean().optional().default(false).describe("Include 24hr price change"),
            include_last_updated_at: z.boolean().optional().default(false).describe("Include last updated timestamp"),
        })
        .strict(),
) {}

export class GetCoinDataParameters extends createToolParameters(
    z
        .object({
            id: z.string().describe("Asset platform id (e.g., 'ethereum')"),
            contract_address: z.string().describe("Token contract address"),
            include_platform: z.boolean().optional().default(false).describe("Include platform contract addresses"),
            include_tickers: z.boolean().optional().default(false).describe("Include ticker data"),
            include_market_data: z.boolean().optional().default(false).describe("Include market data"),
            include_community_data: z.boolean().optional().default(false).describe("Include community data"),
            include_developer_data: z.boolean().optional().default(false).describe("Include developer data"),
        })
        .strict(),
) {}

export class GetSupportedCoinsParameters extends createToolParameters(
    z
        .object({
            include_platform: z.boolean().optional().default(false).describe("Include platform contract addresses"),
        })
        .strict(),
) {}

export class GetHistoricalDataParameters extends createToolParameters(
    z
        .object({
            id: z.string().describe("The coin id (e.g., 'bitcoin')"),
            date: z.string().describe("The date of data snapshot in dd-mm-yyyy format"),
            localization: z.boolean().optional().default(true).describe("Include localized languages in response"),
        })
        .strict(),
) {}

export class GetCoinOhlcParameters extends createToolParameters(
    z
        .object({
            id: z.string().describe("The coin id (e.g., 'bitcoin')"),
            vs_currency: z.string().describe("The target currency of market data (usd, eur, jpy, etc.)"),
            days: z.string().describe("Data up to number of days ago (1/7/14/30/90/180/365/max)"),
        })
        .strict(),
) {}
