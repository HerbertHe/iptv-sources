import { defineConfig } from "tsup"

export const tsup = defineConfig({
    entry: ["src/index.ts", "src/serve.ts"],
    outDir: "dist",
    clean: true,
    format: ["esm"],
})
