// 環境データ（背景・天候など）
export interface EnvironmentData {
    weather?: "rain" | "fog" | "snow" | "clear";
    timeOfDay?: "day" | "night" | "dusk" | "dawn";
    background?: string; // 背景画像のキー
}