import { PluginBase } from "@goat-sdk/core";
import { CoinGeckoService } from "./coingecko.service";

interface CoingeckoPluginOptions {
    apiKey: string;
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
