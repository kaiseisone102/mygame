// src/main/save/saveFile.ts
import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import type { SaveData } from "../../shared/save/SaveData";

const saveDir = path.join(app.getPath("userData"), "save");

// 保存フォルダ作成
if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
}

// スロットごとのファイルパス
function saveFilePath(slotId: number) {
    return path.join(saveDir, `saveSlot${slotId}.json`);
}

// 保存
export function saveSlot(slotId: number, data: SaveData) {
    fs.writeFileSync(saveFilePath(slotId), JSON.stringify(data, null, 2), "utf-8");
}

// 読み込み
export function loadSlot(slotId: number): SaveData | null {
    const file = saveFilePath(slotId);
    if (!fs.existsSync(file)) return null;

    try {
        const raw = fs.readFileSync(file, "utf-8");
        return JSON.parse(raw) as SaveData;
    } catch {
        return null;
    }
}