// src/main/save/saveFile.ts

import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import type { SaveData } from "../../shared/save/SaveData";
import { sanitizeData } from "../../shared/utils/Sanitizer";

function getSaveDir() {
    const dir = path.join(app.getPath("userData"), "save");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

// 保存フォルダ作成
if (!fs.existsSync(getSaveDir())) {
    fs.mkdirSync(getSaveDir(), { recursive: true });
}

// スロットごとのファイルパス
function saveFilePath(slotId: number) {
    return path.join(getSaveDir(), `saveSlot${slotId}.json`);
}

// 保存
export function saveSlot(slotId: number, data: SaveData) {
    const filePath = path.join(getSaveDir(), `saveSlot${slotId}.json`);

    const cleanData = sanitizeData(data);

    fs.writeFileSync(
        filePath,
        JSON.stringify(cleanData, null, 2),
        "utf-8"
    );
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