import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

const commonSchema = z.object({
    chain: z.string().describe("Blockchain network").optional(),
    checkLiquidity: z.number().describe("Check liquidity flag").optional(),
    includeLiquidity: z.boolean().describe("Include liquidity information").optional(),
});

export class GetPriceParameters extends createToolParameters(
    commonSchema.extend({
        address: z.string().describe("Token address"),
    }),
) {}

export class GetMultiPriceParameters extends createToolParameters(
    commonSchema.extend({
        addresses: z.array(z.string()).describe("Array of token addresses"),
    }),
) {}

export class GetHistoricalPriceParameters extends createToolParameters(
    commonSchema.extend({
        address: z.string().describe("Token address"),
        type: z.enum(["1H", "1D", "1W", "1M", "1Y", "ALL"]).describe("Time range for historical data"),
    }),
) {}

export class GetTokenMetadataParameters extends createToolParameters(
    commonSchema.extend({
        address: z.string().describe("Token address"),
    }),
) {}

export class GetMultiTokenMetadataParameters extends createToolParameters(
    commonSchema.extend({
        addresses: z.array(z.string()).describe("Array of token addresses"),
    }),
) {}

export class GetTokenOverviewParameters extends createToolParameters(
    commonSchema.extend({
        address: z.string().describe("Token address"),
    }),
) {}

export class GetTokenSecurityParameters extends createToolParameters(
    commonSchema.extend({
        address: z.string().describe("Token address"),
    }),
) {}

export class GetTokenMarketDataParameters extends createToolParameters(
    commonSchema.extend({
        address: z.string().describe("Token address"),
    }),
) {}

export class GetTokenTradeDataParameters extends createToolParameters(
    commonSchema.extend({
        address: z.string().describe("Token address"),
    }),
) {}

export class GetMultiTokenTradeDataParameters extends createToolParameters(
    commonSchema.extend({
        addresses: z.array(z.string()).describe("Array of token addresses"),
    }),
) {}
