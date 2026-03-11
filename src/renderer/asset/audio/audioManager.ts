// src/renderer/audio/audioManager.ts
class AudioManager {
    private bgm: HTMLAudioElement | null = null;
    private currentBgmSrc: string | null = null;

    private masterVolume = 1.0;
    private bgmVolume = 0;
    private seVolume = 0.8;

    private bgmBaseVolume = 0;

    private bgmFadeTimer: number | null = null;
    private seCache = new Map<string, HTMLAudioElement>();

    /* ======================
       再計算
    ====================== */
    private applyBgmVolume() {
        if (this.bgm) {
            let v =
                this.bgmBaseVolume *
                this.bgmVolume *
                this.masterVolume;
            this.bgm.volume = Math.min(1, v);
        }
    }
    /* ======================
       BGM
    ====================== */
    playBGM(
        src: string,
        volume = 1.0,
        fadeDuration = 0,
        restart = false
    ) {
        if (!restart && this.currentBgmSrc === src) return;

        this.currentBgmSrc = src;
        this.bgmBaseVolume = volume;
        // 既存BGMを止める
        const startNewBgm = () => {

            const newBgm = new Audio(src);
            newBgm.loop = true;
            newBgm.volume = 0;

            this.bgm = newBgm;
            this.applyBgmVolume();

            newBgm.play();

            if (fadeDuration > 0) {
                this.fadeIn(newBgm, volume, fadeDuration);
            }
        };

        // 既存BGMがある場合
        if (this.bgm) {
            if (fadeDuration > 0) {
                const oldBgm = this.bgm;
                this.fadeOut(oldBgm, fadeDuration, () => {
                    oldBgm.pause();
                    startNewBgm();
                });
            } else {
                this.bgm.pause();
                startNewBgm();
            }
        } else {
            startNewBgm();
        }
    }
    stopBGM(fadeDuration = 0) {
        if (!this.bgm) return;

        if (fadeDuration > 0) {
            this.fadeOut(this.bgm, fadeDuration, () => {
                this.bgm?.pause();
                this.bgm = null;
            });
        } else {
            this.bgm.pause();
            this.bgm = null;
        }
    }
    /* ======================
       フェード処理
    ====================== */
    private fadeIn(
        audio: HTMLAudioElement,
        targetVolume: number,
        duration: number
    ) {
        this.clearFade();

        let t = 0;
        const step = targetVolume / (duration / 16);

        this.bgmFadeTimer = window.setInterval(() => {
            t = Math.min(t + step, 1);
            this.bgmBaseVolume = t;
            this.applyBgmVolume();

            if (t >= 1) {
                this.clearFade();
            }
        }, 16);
    }

    private fadeOut(
        audio: HTMLAudioElement,
        duration: number,
        onComplete?: () => void
    ) {
        this.clearFade();

        let t = 1;
        const step = 16 / duration;

        this.bgmFadeTimer = window.setInterval(() => {
            t = Math.max(t - step, 0);
            this.bgmBaseVolume = t;
            this.applyBgmVolume();

            if (t <= 0) {
                this.clearFade();
                onComplete?.();
            }
        }, 16);
    }

    private clearFade() {
        if (this.bgmFadeTimer !== null) {
            clearInterval(this.bgmFadeTimer);
            this.bgmFadeTimer = null;
        }
    }

    /* ======================
       SE
    ====================== */
    playSE(src: string, volume = 1.0) {
        let se = this.seCache.get(src);
        if (!se) {
            se = new Audio(src);
            this.seCache.set(src, se);
        }
        se.currentTime = 0;
        se.volume = volume * this.seVolume * this.masterVolume;
        se.play();
    }

    /* ======================
       setter / getter
    ====================== */
    setMasterVolume(v: number) {
        this.masterVolume = clamp(v);
        this.applyBgmVolume();
    }
    setBgmVolume(v: number) {
        this.bgmVolume = clamp(v);
        this.applyBgmVolume();
    }
    setSeVolume(v: number) {
        this.seVolume = clamp(v);
    }

    getVolumes() {
        return {
            master: this.masterVolume,
            bgm: this.bgmVolume,
            se: this.seVolume,
        };
    }

}

const clamp = (v: number) =>
    Math.max(0, Math.min(v, 1));

export const audioManager = new AudioManager();


