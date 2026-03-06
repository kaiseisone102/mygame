type TextInputHandler = (char: string) => void;

export class TextInputSource {
    private handlers = new Set<TextInputHandler>();

    on(handler: TextInputHandler) {
        this.handlers.add(handler);
    }

    emit(char: string) {
        for (const h of this.handlers) {
            h(char);
        }
    }
}
