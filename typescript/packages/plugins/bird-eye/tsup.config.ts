import { defineConfig } from "tsup";
import { treeShakableConfig } from "../../../tsup.config.base";

export default defineConfig({
    ...treeShakableConfig,
    entry: ["src/index.ts", "src/birdeye.plugin.ts", "src/birdeye.service.ts", "src/parameters.ts"],
});
