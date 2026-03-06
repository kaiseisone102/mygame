

// ===============================
//   メッセージ送りスクリプト本体
// ===============================

const logBox = document.getElementById("logBox") as HTMLElement;

export function showMessages(messages: string[]): Promise<void> {
    return new Promise(function (resolve) {
        let currentMessage = 0;
        let typing = false;
        let interval: ReturnType<typeof setInterval>;

        document.addEventListener("keydown", nextMessageKey);

        function nextMessageKey(event: KeyboardEvent): void {
            // 押されたキーがスペースキーじゃなければreturn
            if (event.code !== "Space") return;

            // タイピング中なら全文を即表示
            if (typing) {
                typing = false;
                if (interval !== null) clearInterval(interval);
                logBox.innerHTML = messages[currentMessage]; // 全文表示
                return; // ここで止めて次へ行かない
            }

            // タイピングが終わっているなら次のメッセージへ進む
            currentMessage++;
            if (currentMessage < messages.length) {
                typeOneMessage(messages[currentMessage]);
            } else {
                document.removeEventListener("keydown", nextMessageKey);
                resolve();
                return;
            }
        }

        function typeOneMessage(text: string): void {
            typing = true;
            logBox.innerHTML = "";
            let i = 0;

            interval = setInterval(() => {
                logBox.innerHTML += text[i];
                i++;

                if (i >= text.length) {
                    clearInterval(interval!);
                    typing = false;
                }
            }, 50);
        }

        // 最初のメッセージ開始
        typeOneMessage(messages[currentMessage]);
    })
}
