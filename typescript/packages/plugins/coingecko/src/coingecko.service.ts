import { Tool } from "@goat-sdk/core";
import {
    GetCoinDataParameters,
    GetCoinOhlcParameters,
    GetCoinPriceParameters,
    GetHistoricalDataParameters,
    GetSupportedCoinsParameters,
    GetTokenPriceParameters,
    GetTrendingCoinsParameters,
    SearchCoinsParameters,
} from "./parameters";

export class CoinGeckoService {
    constructor(private readonly apiKey: string) {}

    @Tool({
        description: "Get the list of trending coins from CoinGecko",
    })
    async getTrendingCoins(parameters: GetTrendingCoinsParameters) {
        const params = new URLSearchParams({
            include_platform: parameters.include_platform.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/search/trending?${params.toString()}&x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get the price of a specific coin from CoinGecko",
    })
    async getCoinPrice(parameters: GetCoinPriceParameters) {
        const {
            coin_id,
            vs_currency,
            include_market_cap,
            include_24hr_vol,
            include_24hr_change,
            include_last_updated_at,
        } = parameters;
        const params = new URLSearchParams({
            ids: coin_id,
            vs_currencies: vs_currency,
            include_market_cap: include_market_cap.toString(),
            include_24hr_vol: include_24hr_vol.toString(),
            include_24hr_change: include_24hr_change.toString(),
            include_last_updated_at: include_last_updated_at.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?${params.toString()}&x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Search for coins by query string using CoinGecko",
    })
    async searchCoins(parameters: SearchCoinsParameters) {
        const params = new URLSearchParams({
            query: parameters.query,
            exact_match: parameters.exact_match.toString(),
            include_platform: parameters.include_platform.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/search?${params.toString()}&x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get token price by contract address using CoinGecko",
    })
    async getTokenPrice(parameters: GetTokenPriceParameters) {
        const {
            id,
            contract_addresses,
            vs_currencies,
            include_market_cap,
            include_24hr_vol,
            include_24hr_change,
            include_last_updated_at,
        } = parameters;
        const params = new URLSearchParams({
            contract_addresses,
            vs_currencies,
            include_market_cap: include_market_cap.toString(),
            include_24hr_vol: include_24hr_vol.toString(),
            include_24hr_change: include_24hr_change.toString(),
            include_last_updated_at: include_last_updated_at.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/${id}?${params.toString()}&x_cg_demo_api_key=${
                this.apiKey
            }`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get detailed coin data by contract address using CoinGecko",
    })
    async getCoinData(parameters: GetCoinDataParameters) {
        const {
            id,
            contract_address,
            include_platform,
            include_tickers,
            include_market_data,
            include_community_data,
            include_developer_data,
        } = parameters;
        const params = new URLSearchParams({
            include_platform: include_platform.toString(),
            include_tickers: include_tickers.toString(),
            include_market_data: include_market_data.toString(),
            include_community_data: include_community_data.toString(),
            include_developer_data: include_developer_data.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}/contract/${contract_address}?${params.toString()}&x_cg_demo_api_key=${
                this.apiKey
            }`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get list of all supported coins from CoinGecko",
    })
    async getSupportedCoins(parameters: GetSupportedCoinsParameters) {
        const params = new URLSearchParams({
            include_platform: parameters.include_platform.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/list?${params.toString()}&x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get historical data for a specific coin from CoinGecko",
    })
    async getHistoricalData(parameters: GetHistoricalDataParameters) {
        const { id, date, localization } = parameters;
        const params = new URLSearchParams({
            date,
            localization: localization.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}/history?${params.toString()}&x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    @Tool({
        description: "Get OHLC chart data for a specific coin from CoinGecko",
    })
    async getCoinOhlc(parameters: GetCoinOhlcParameters) {
        const { id, vs_currency, days } = parameters;
        const params = new URLSearchParams({
            vs_currency,
            days: days.toString(),
        });
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${id}/ohlc?${params.toString()}&x_cg_demo_api_key=${this.apiKey}`,
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
}
