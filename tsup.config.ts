import { defineConfig } from "tsup"

export const tsup = defineConfig({
    entry: ["src/index.ts", "src/serve.ts", "src/matrix.ts"],
    outDir: "dist",
    clean: true,
    format: ["esm"],
    minify: process.env.NODE_ENV !== "development",
})
