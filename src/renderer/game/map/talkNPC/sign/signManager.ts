// src/renderer/game/map/sign/SignManager.ts
import { SignData } from "../SignData";

export class SignManager {
    private signs: SignData[] = [];

    addSign(sign: SignData) {
        this.signs.push(sign);
    }

    getSigns(): SignData[] {
        return this.signs;
    }
}
