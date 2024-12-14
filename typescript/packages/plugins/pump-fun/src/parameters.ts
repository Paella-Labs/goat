import { z } from "zod";

export const createPumpFunTokenParameters = z.object({
    tokenName: z.string()
        .min(1, "Token name must not be empty")
        .max(32, "Token name must not exceed 32 characters")
        .describe("Name of the token to create"),
});

export type CreatePumpFunTokenParameters = z.infer<typeof createPumpFunTokenParameters>;
