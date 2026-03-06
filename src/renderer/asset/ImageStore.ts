// src/renderer/assets/ImageStore.ts
export class ImageStore {
    private static images = new Map<string, HTMLImageElement>();

    static async load(key: string, src: string) {
        const img = new Image();
        img.src = src;
        try {
            await img.decode();
        } catch (error) {
            console.error(`ImageStore: decode failed -> ${key}`, src, error);
            throw error;
        }
        this.images.set(key, img);
        return img;
    }

    static get(key: string) {
        const img = this.images.get(key);
        if (!img) {
            throw new Error(`ImageStore: image not found -> ${key}`);
        }
        return this.images.get(key)!;
    }
}
