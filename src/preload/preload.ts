// src/preload/preload.ts
import { contextBridge, ipcRenderer } from "electron";
import { SaveData } from "../shared/save/SaveData";

console.log("preload loaded", location.href);

contextBridge.exposeInMainWorld("saveGameAPI", {
    saveGameFile: (id: number, data: SaveData) => ipcRenderer.invoke("save-game", id, data),
    loadGameFile: (id: number) => ipcRenderer.invoke("load-game", id)
});
contextBridge.exposeInMainWorld("configAPI", {
    loadConfig: () => ipcRenderer.invoke("load-config"),
    saveConfig: (config: any) => ipcRenderer.invoke("save-config", config),
});