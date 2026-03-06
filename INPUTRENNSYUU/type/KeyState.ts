/** 
 * 役割:
 * keyDown / keyUp を拾う
 * 今押されているか？
 * 何フレーム押され続けているか？
 * 前フレームとの差分
 */
export class KeyState {
    pressed: boolean = false;
    justPressed: boolean = false;
    justReleased: boolean = false;
    holdTime: number = 0;
}