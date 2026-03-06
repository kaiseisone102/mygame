// mygame/vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    root: path.resolve(__dirname, "src/renderer"),
    base: "./", // game.html が ".app.ts" を読み込む
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@renderer": path.resolve(__dirname, "src/renderer"),
            "@/shared": path.resolve(__dirname, "src/shared"),
        }
    },

    build: {
        outDir: path.resolve(__dirname, "dist/renderer"),
        emptyOutDir: false,
        rollupOptions: {
            input: {
                game: path.resolve(__dirname, "src/renderer/game.html"),
            },
        },
    },
});
