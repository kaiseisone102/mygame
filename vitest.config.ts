// vitest.config.ts
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        css: false, // .css を見ない
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@renderer": path.resolve(__dirname, "src/renderer"),
            "@/shared": path.resolve(__dirname, "src/shared"),
        }
    }
})
