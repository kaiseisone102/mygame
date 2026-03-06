// src/main/save/saveManagerFunctions.ts
import * as fs from "fs";
import * as path from "path";
import * as LZString from "lz-string";
import { app } from "electron";
import { SaveData } from "../../shared/save/SaveData";
// 保存ファイルのラッパー型
interface SaveFile {
    version: number;      // バージョン番号
    data: SaveData;       // 実際のセーブデータ
}
// --------------------
// save function
// --------------------
// 1. 暗号化
function encrypt(data: string): string {
    const key = 0x75;
    let result = "";

    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key);
    }
    return result;
}

// 保存するパス
function saveDir(): string {
    return path.join(app.getPath("userData"), "save");
}
function saveFilePath(id: number): string {
    return path.join(saveDir(), `savefile${id}.save`);
}
if (!fs.existsSync(saveDir())) {
    fs.mkdirSync(saveDir(), { recursive: true });
}

// セーブ処理
export function saveGameFile(id: number, data: SaveData): void {
    const wrapped = {
        version: 1,
        data,
    };
    // ① JSON → 文字列
    const json = JSON.stringify(wrapped);
    // ② LZString で圧縮
    const compressed = LZString.compressToBase64(json);
    // ③ 簡易暗号化（XOR）
    const encrypted = encrypt(compressed);

    // ④ ファイル保存
    fs.writeFileSync(saveFilePath(id), encrypted, "utf8");
}


//-----------------
// load function
// ----------------
// 復号
function decrypt(data: string): string {
    return encrypt(data); // XOR は同じ処理で復号できる
}

export function loadGameFile(id: number): SaveData | null {
    const file = saveFilePath(id);

    if (!fs.existsSync(file)) return null;

    const encrypted = fs.readFileSync(file, "utf8");
    // ① 復号
    const compressed = decrypt(encrypted);
    // ② 解凍
    const json = LZString.decompressFromBase64(compressed);
    if (!json) return null;

    const parsed: SaveFile = JSON.parse(json);

    // バージョンチェック
    if (parsed.version !== 1) {
        console.warn("Unsupported save version:", parsed.version);
        return null;
    }

    return parsed.data;
}
