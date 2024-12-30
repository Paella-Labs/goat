import { Tool } from "@goat-sdk/core";
import {
    GetCoinOhlcParameters,
    GetCoinPriceParameters,
    GetHistoricalDataParameters,
    GetSupportedCoinsParameters,
    GetTokenPriceParameters,
    GetTrendingCoinsParameters,
    SearchCoinsParameters,
} from "./parameters";

export class CoinGeckoService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor(apiKey: string, usePro: boolean = false) {
        this.baseUrl = usePro ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
        this.headers = {
            [usePro ? "x-cg-pro-api-key" : "x-cg-demo-api-key"]: apiKey,
        };
    }

    private async fetchWithKey(endpoint: string, params: URLSearchParams = new URLSearchParams()): Promise<any> {
        const url = `${this.baseUrl}${endpoint}?${params.toString()}`;
        const response = await fetch(url, { headers: this.headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    @Tool({
        description: "Get the list of trending coins from CoinGecko",
    })
    async getTrendingCoins(parameters: GetTrendingCoinsParameters) {
        const params = new URLSearchParams();
        if (parameters.include_platform) {
            params.append("include_platform", parameters.include_platform.toString());
        }
        return this.fetchWithKey("/search/trending", params);
    }

    @Tool({
        description: "Get the price of a specific coin from CoinGecko",
    })
    async getCoinPrice(parameters: GetCoinPriceParameters) {
        const params = new URLSearchParams({
            ids: parameters.ids,
            vs_currencies: parameters.vs_currencies,
            include_market_cap: parameters.include_market_cap.toString(),
            include_24hr_vol: parameters.include_24hr_vol.toString(),
            include_24hr_change: parameters.include_24hr_change.toString(),
            include_last_updated_at: parameters.include_last_updated_at.toString(),
        });
        return this.fetchWithKey("/simple/price", params);
    }

    @Tool({
        description: "Search for coins, categories and markets on CoinGecko",
    })
    async searchCoins(parameters: SearchCoinsParameters) {
        const params = new URLSearchParams({
            query: parameters.query,
        });
        if (parameters.exact_match) {
            params.append("exact_match", parameters.exact_match.toString());
        }
        return this.fetchWithKey("/search", params);
    }

    @Tool({
        description: "Get token price by contract address using CoinGecko",
    })
    async getTokenPrice(parameters: GetTokenPriceParameters) {
        const params = new URLSearchParams({
            contract_addresses: parameters.token_addresses,
            vs_currencies: parameters.vs_currencies,
        });
        if (parameters.include_market_cap) {
            params.append("include_market_cap", parameters.include_market_cap.toString());
        }
        if (parameters.include_24hr_vol) {
            params.append("include_24hr_vol", parameters.include_24hr_vol.toString());
        }
        if (parameters.include_24hr_change) {
            params.append("include_24hr_change", parameters.include_24hr_change.toString());
        }
        if (parameters.include_last_updated_at) {
            params.append("include_last_updated_at", parameters.include_last_updated_at.toString());
        }
        if (parameters.precision) {
            params.append("precision", parameters.precision.toString());
        }
        return this.fetchWithKey(`/simple/token_price/${parameters.platform_id}`, params);
    }

    @Tool({
        description: "Get list of all supported coins from CoinGecko",
    })
    async getSupportedCoins(parameters: GetSupportedCoinsParameters) {
        const params = new URLSearchParams();
        if (parameters.include_platform) {
            params.append("include_platform", parameters.include_platform.toString());
        }
        return this.fetchWithKey("/coins/list", params);
    }

    @Tool({
        description: "Get historical data for a specific coin from CoinGecko",
    })
    async getHistoricalData(parameters: GetHistoricalDataParameters) {
        const params = new URLSearchParams({
            date: parameters.date,
            localization: parameters.localization.toString(),
        });
        return this.fetchWithKey(`/coins/${parameters.coin_id}/history`, params);
    }

    @Tool({
        description: "Get OHLC chart data for a specific coin from CoinGecko",
    })
    async getCoinOhlc(parameters: GetCoinOhlcParameters) {
        const params = new URLSearchParams({
            vs_currency: parameters.vs_currency,
            days: parameters.days,
        });
        return this.fetchWithKey(`/coins/${parameters.coin_id}/ohlc`, params);
    }
}
