// src/main/main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { loadGameFile, saveGameFile } from "./save/saveFunctions";
import { loadConfig, saveConfig } from "./save/config";

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
    saveGameFile(id, data);
    return true;
});

ipcMain.handle("load-game", async (_event, id: number) => {
    return loadGameFile(id);
});

ipcMain.handle("load-config", () => {
    return loadConfig();
});

ipcMain.handle("save-config", (_, config) => {
    saveConfig(config);
});

console.log(app.getPath("userData"));

app.whenReady().then(createWindow);
