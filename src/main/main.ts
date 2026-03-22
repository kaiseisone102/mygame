// src/main/main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
// 暗号化セーブ
import { loadGameFile, saveGameFile } from "./save/saveFunctions";
import { loadConfig, saveConfig } from "./save/config";
// jsonセーブ
import { saveSlot, loadSlot } from "./save/saveFile";

function createWindow() {
    const win = new BrowserWindow({
        width: 1800,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, "../../preload/preload/preload.js"),
            contextIsolation: true,
            sandbox: false,
            nodeIntegration: false,
        }
    });

    if (process.env.NODE_ENV === "development") {
        win.loadURL("http://localhost:5173/renderer/game.html");
    } else {
        // dist/main/main.js から見た位置 → dist/index.html
        win.loadFile(path.join(__dirname, "../../renderer/game.html"));

    }
}

// --- IPC ---
ipcMain.handle("save-game", async (_event, id: number, data) => {
    console.log(`[IPC] save-game: Slot ${id} - Saving...`);
    try {
        // 暗号化セーブ
        //saveGameFile(id, data);

        // jsonセーブ
        saveSlot(id, data);

        console.log(`[IPC] save-game: Slot ${id} - Success`);
        return true;
    } catch (e) {
        console.error(`[IPC] save-game Error:`, e);
        return false;
    }
});

ipcMain.handle("load-game", async (_event, id: number) => {
    // 暗号化セーブデータ翻訳ロード
    // const data = loadGameFile(id);
    console.log(`[IPC] load-game: Slot ${id} - Loading...`);

    // jsonデータロード
    const data = loadSlot(id);
    console.log(`[IPC] load-game: Slot ${id} - ${data ? "Data Found" : "No Data"}`);
    return data;
});

ipcMain.handle("load-config", () => {
    console.log("[IPC] load-config: Requesting...");
    const config = loadConfig();
    // 実際にファイルから読み込んだ値をここで出力
    console.log("[IPC] load-config: Loaded values ->", JSON.stringify(config));
    return config;
});

ipcMain.handle("save-config", async (event, config) => { // asyncを追加
    if (!config) {
        console.error("[IPC] save-config: Error - config is undefined!");
        return false;
    }

    try {
        saveConfig(config);
        // 保存直後に再度ロードしてみて、ファイルへの書き込みを物理的に検証
        const verify = loadConfig();
        console.log("[IPC] save-config: Verified on disk ->", JSON.stringify(verify));
        return true;
    } catch (e) {
        console.error("[IPC] save-config: Error during write:", e);
        return false;
    }
});

console.log(app.getPath("userData"));

app.whenReady().then(createWindow);
