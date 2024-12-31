import { Tool } from "@goat-sdk/core";
import {
    GetCoinPriceParameters,
    GetTrendingCoinsParameters,
    SearchCoinsParameters,
    GetCoinByContractParameters,
    GetAllCoinsParameters,
    GetHistoricalDataParameters,
    GetOhlcParameters,
} from "./parameters";

export class CoinGeckoService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor(apiKey: string, usePro: boolean = false) {
        this.baseUrl = usePro
            ? "https://pro-api.coingecko.com/api/v3"
            : "https://api.coingecko.com/api/v3";
        
        const headerKey = usePro ? "x-cg-pro-api-key" : "x-cg-demo-api-key";
        this.headers = {
            [headerKey]: apiKey,
            "Content-Type": "application/json",
        };
    }

    private async fetchWithKey(endpoint: string, params?: URLSearchParams): Promise<any> {
        const url = `${this.baseUrl}${endpoint}${params ? `?${params.toString()}` : ""}`;
        const response = await fetch(url, { headers: this.headers });
        
        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} - ${await response.text()}`);
        }
        
        return response.json();
    }

    @Tool({
        description: "Get the list of trending coins from CoinGecko",
    })
    async getTrendingCoins(parameters: GetTrendingCoinsParameters) {
        return this.fetchWithKey("/search/trending");
    }

    @Tool({
        description: "Get the price of a specific coin from CoinGecko",
    })
    async getCoinPrice(parameters: GetCoinPriceParameters) {
        const { coinId, vsCurrency, includeMarketCap, include24hrVol, include24hrChange, includeLastUpdatedAt } =
            parameters;
        const params = new URLSearchParams({
            ids: coinId,
            vs_currencies: vsCurrency,
            include_market_cap: includeMarketCap.toString(),
            include_24hr_vol: include24hrVol.toString(),
            include_24hr_change: include24hrChange.toString(),
            include_last_updated_at: includeLastUpdatedAt.toString(),
        });
        return this.fetchWithKey("/simple/price", params);
    }

    @Tool({
        description: "Search for coins on CoinGecko",
    })
    async searchCoins(parameters: SearchCoinsParameters) {
        const { query, exact_match } = parameters;
        const params = new URLSearchParams({
            query,
            ...(exact_match && { exact_match: exact_match.toString() }),
        });
        return this.fetchWithKey("/search", params);
    }

    @Tool({
        description: "Get coin data by contract address",
    })
    async getCoinByContract(parameters: GetCoinByContractParameters) {
        const { contractAddress, platformId } = parameters;
        return this.fetchWithKey(`/coins/${platformId}/contract/${contractAddress}`);
    }

    @Tool({
        description: "Get list of all supported coins",
    })
    async getAllCoins(parameters: GetAllCoinsParameters) {
        const { includePlatform } = parameters;
        const params = new URLSearchParams({
            include_platform: includePlatform.toString(),
        });
        return this.fetchWithKey("/coins/list", params);
    }

    @Tool({
        description: "Get historical data for a coin",
    })
    async getHistoricalData(parameters: GetHistoricalDataParameters) {
        const { id, days, interval } = parameters;
        const params = new URLSearchParams({
            days: days.toString(),
            ...(interval && { interval }),
        });
        return this.fetchWithKey(`/coins/${id}/market_chart`, params);
    }

    @Tool({
        description: "Get OHLC data for a coin",
    })
    async getOhlcData(parameters: GetOhlcParameters) {
        const { id, vsCurrency, days } = parameters;
        const params = new URLSearchParams({
            vs_currency: vsCurrency,
            days: days.toString(),
        });
        return this.fetchWithKey(`/coins/${id}/ohlc`, params);
    }
}
