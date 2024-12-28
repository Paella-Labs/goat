import { PluginBase } from "@goat-sdk/core";
import { BirdEyeService } from "./birdeye.service";

interface BirdEyePluginOptions {
    apiKey: string;
}

export class BirdEyePlugin extends PluginBase {
    constructor({ apiKey }: BirdEyePluginOptions) {
        super("birdEye", [new BirdEyeService(apiKey)]);
    }

    supportsChain = () => true;
}

export function birdEye(options: BirdEyePluginOptions) {
    return new BirdEyePlugin(options);
}
