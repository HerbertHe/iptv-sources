import { defineConfig } from "tsup"

export const tsup = defineConfig({
    entry: ["src/index.ts", "src/vercel.ts"],
    outDir: "dist",
    clean: true,
    format: ["esm"],
})
