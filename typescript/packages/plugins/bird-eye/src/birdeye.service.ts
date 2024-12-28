import { Tool } from "@goat-sdk/core";
import {
    GetHistoricalPriceParameters,
    GetMultiPriceParameters,
    GetMultiTokenMetadataParameters,
    GetMultiTokenTradeDataParameters,
    GetPriceParameters,
    GetTokenMarketDataParameters,
    GetTokenMetadataParameters,
    GetTokenOverviewParameters,
    GetTokenSecurityParameters,
    GetTokenTradeDataParameters,
} from "./parameters";

const BASE_URL = "https://public-api.birdeye.so";

export class BirdEyeService {
    private readonly priceParams = new GetPriceParameters();
    private readonly multiPriceParams = new GetMultiPriceParameters();
    private readonly historicalPriceParams = new GetHistoricalPriceParameters();
    private readonly tokenMetadataParams = new GetTokenMetadataParameters();
    private readonly multiTokenMetadataParams = new GetMultiTokenMetadataParameters();
    private readonly tokenOverviewParams = new GetTokenOverviewParameters();
    private readonly tokenSecurityParams = new GetTokenSecurityParameters();
    private readonly tokenMarketDataParams = new GetTokenMarketDataParameters();
    private readonly tokenTradeDataParams = new GetTokenTradeDataParameters();
    private readonly multiTokenTradeDataParams = new GetMultiTokenTradeDataParameters();
    constructor(private readonly apiKey: string) {}

    private async fetchFromBirdEye(endpoint: string, params: Record<string, unknown> = {}) {
        const url = new URL(`${BASE_URL}${endpoint}`);
        // Add query parameters
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                if (Array.isArray(value)) {
                    url.searchParams.set(key, value.join(","));
                } else {
                    url.searchParams.set(key, String(value));
                }
            }
        }

        const response = await fetch(url.toString(), {
            headers: {
                "X-API-KEY": this.apiKey,
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`BirdEye API error (${response.status}): ${response.statusText}`);
        }

        return response.json();
    }

    @Tool({
        description: "Get the current price of a token from BirdEye",
    })
    async getPrice(parameters: GetPriceParameters) {
        return this.fetchFromBirdEye("/defi/price", {
            address: parameters.address,
            chain: parameters.chain,
            check_liquidity: parameters.checkLiquidity,
            include_liquidity: parameters.includeLiquidity,
        });
    }

    @Tool({
        description: "Get prices for multiple tokens in a single call",
    })
    async getMultiPrice(parameters: GetMultiPriceParameters) {
        return this.fetchFromBirdEye("/defi/multi_price", {
            address: parameters.addresses.join(","),
            chain: parameters.chain,
            check_liquidity: parameters.checkLiquidity,
            include_liquidity: parameters.includeLiquidity,
        });
    }

    @Tool({
        description: "Get historical price data for a token",
    })
    async getHistoricalPrice(parameters: GetHistoricalPriceParameters) {
        return this.fetchFromBirdEye("/defi/history_price", {
            address: parameters.address,
            type: parameters.type,
            chain: parameters.chain,
            check_liquidity: parameters.checkLiquidity,
            include_liquidity: parameters.includeLiquidity,
        });
    }

    @Tool({
        description: "Get metadata for a single token",
    })
    async getTokenMetadata(parameters: GetTokenMetadataParameters) {
        return this.fetchFromBirdEye("/defi/v3/token/meta-data/single", {
            address: parameters.address,
            chain: parameters.chain,
        });
    }

    @Tool({
        description: "Get metadata for multiple tokens",
    })
    async getMultiTokenMetadata(parameters: GetMultiTokenMetadataParameters) {
        return this.fetchFromBirdEye("/defi/v3/token/meta-data/multi", {
            addresses: parameters.addresses.join(","),
            chain: parameters.chain,
        });
    }

    @Tool({
        description: "Get detailed overview of a token including price, market cap, and supply information",
    })
    async getTokenOverview(parameters: GetTokenOverviewParameters) {
        return this.fetchFromBirdEye("/defi/v3/token/overview", {
            address: parameters.address,
            chain: parameters.chain,
        });
    }

    @Tool({
        description: "Get security information and risk analysis for a token",
    })
    async getTokenSecurity(parameters: GetTokenSecurityParameters) {
        return this.fetchFromBirdEye("/defi/v3/token/security", {
            address: parameters.address,
            chain: parameters.chain,
        });
    }

    @Tool({
        description: "Get market data for a token including volume and liquidity metrics",
    })
    async getTokenMarketData(parameters: GetTokenMarketDataParameters) {
        return this.fetchFromBirdEye("/defi/v3/token/market-data", {
            address: parameters.address,
            chain: parameters.chain,
        });
    }

    @Tool({
        description: "Get trading data for a single token",
    })
    async getTokenTradeData(parameters: GetTokenTradeDataParameters) {
        return this.fetchFromBirdEye("/defi/v3/token/trade-data", {
            address: parameters.address,
            chain: parameters.chain,
        });
    }

    @Tool({
        description: "Get trading data for multiple tokens",
    })
    async getMultiTokenTradeData(parameters: GetMultiTokenTradeDataParameters) {
        return this.fetchFromBirdEye("/defi/v3/token/trade-data/multi", {
            addresses: parameters.addresses.join(","),
            chain: parameters.chain,
        });
    }
}
