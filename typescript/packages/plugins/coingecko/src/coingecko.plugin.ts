import { PluginBase } from "@goat-sdk/core";
import { CoinGeckoService } from "./coingecko.service";

interface CoingeckoPluginOptions {
    apiKey: string;
    /**
     * Whether to use the Pro API endpoints (https://pro-api.coingecko.com/api/v3)
     * When true, uses x-cg-pro-api-key header instead of x-cg-demo-api-key
     */
    usePro?: boolean;
}

export class CoinGeckoPlugin extends PluginBase {
    constructor({ apiKey, usePro = false }: CoingeckoPluginOptions) {
        super("coingecko", [new CoinGeckoService(apiKey, usePro)]);
    }

    supportsChain = () => true;
}

export function coingecko(options: CoingeckoPluginOptions) {
    return new CoinGeckoPlugin(options);
}
