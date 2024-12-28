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
    private readonly baseUrl = "https://api.coingecko.com/api/v3";
    constructor(private readonly apiKey: string) {}

    private async fetchWithKey(endpoint: string, params?: URLSearchParams) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        if (params) {
            url.search = params.toString();
        }
        url.searchParams.append("x_cg_demo_api_key", this.apiKey);

        const response = await fetch(url.toString());
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
        description: "Search for coins, categories and markets listed on CoinGecko",
    })
    async searchCoins(parameters: SearchCoinsParameters) {
        const params = new URLSearchParams({
            query: parameters.query,
        });
        return this.fetchWithKey("/search", params);
    }

    @Tool({
        description: "Get current price of tokens by contract address",
    })
    async getTokenPrice(parameters: GetTokenPriceParameters) {
        const params = new URLSearchParams({
            contract_addresses: parameters.token_addresses,
            vs_currencies: parameters.vs_currencies,
        });

        if (parameters.include_market_cap) {
            params.append("include_market_cap", "true");
        }
        if (parameters.include_24hr_vol) {
            params.append("include_24hr_vol", "true");
        }
        if (parameters.include_24hr_change) {
            params.append("include_24hr_change", "true");
        }
        if (parameters.include_last_updated_at) {
            params.append("include_last_updated_at", "true");
        }
        if (parameters.precision) {
            params.append("precision", parameters.precision.toString());
        }

        return this.fetchWithKey(`/simple/token_price/${parameters.platform_id}`, params);
    }

    @Tool({
        description: "Get the list of all supported coins with their id, name, and symbol",
    })
    async getSupportedCoins(parameters: GetSupportedCoinsParameters) {
        const params = new URLSearchParams();
        if (parameters.include_platform) {
            params.append("include_platform", "true");
        }
        return this.fetchWithKey("/coins/list", params);
    }

    @Tool({
        description: "Get historical data (name, price, market, stats) at a given date for a coin",
    })
    async getHistoricalData(parameters: GetHistoricalDataParameters) {
        const params = new URLSearchParams({
            date: parameters.date,
            localization: parameters.localization.toString(),
        });
        return this.fetchWithKey(`/coins/${parameters.coin_id}/history`, params);
    }

    @Tool({
        description: "Get coin's OHLC (Open, High, Low, Close) price data",
    })
    async getCoinOhlc(parameters: GetCoinOhlcParameters) {
        const params = new URLSearchParams({
            vs_currency: parameters.vs_currency,
            days: parameters.days,
        });
        return this.fetchWithKey(`/coins/${parameters.coin_id}/ohlc`, params);
    }

    @Tool({
        description: "Get the current price of any cryptocurrencies in any other supported currencies that you need",
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
}
