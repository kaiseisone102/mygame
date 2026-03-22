// src/shared/utils/Sanitizer.ts

export const sanitizeData = (data: any): any => {
    // 数値なら小数点第1位で丸める（0.1刻み）
    if (typeof data === "number") {
        return Math.round(data * 10) / 10;
    }

    // 配列なら中身を掃除
    if (Array.isArray(data)) {
        return data.map(sanitizeData);
    }

    // オブジェクトなら各プロパティを掃除
    if (typeof data === "object" && data !== null) {
        const cleanObj: any = {};
        for (const key in data) {
            cleanObj[key] = sanitizeData(data[key]);
        }
        return cleanObj;
    }

    return data;
};