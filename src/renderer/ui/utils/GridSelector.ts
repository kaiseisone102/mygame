// src/renderer/ui/utils/MenuGridNavigator.ts

export type GridNavState = {
    selectedIndex: number;
    currentPage: number;
};

export class MenuGridNavigator {
    constructor(
        private itemsPerPage: number,
        private cols: number = 2
    ) {}

    /**
      * @param axis 入力方向
     * @param state 現在のインデックスとページ
     * @param getItemsCount ページ切り替えが発生した際に、新しいページのアイテム数を取得するためのコールバック
     */
    handleMove(
        axis: "UP" | "DOWN" | "LEFT" | "RIGHT",
        state: GridNavState,
        totalItemsCount: number,
        getItemsCount: (targetPage: number) => number
    ): GridNavState & { isChanged: boolean } {
        let { selectedIndex, currentPage } = state;
        const totalPages = Math.ceil(totalItemsCount / this.itemsPerPage);
        
        // 現在のページでのアイテム数
        let currentItemsLength = getItemsCount(currentPage);
        const rows = Math.ceil(currentItemsLength / this.cols);
        let row = Math.floor(selectedIndex / this.cols);
        /* 縦列 **/
        let col = selectedIndex % this.cols;

        switch (axis) {
            case "UP":
                let newRow = row - 1;
                if (newRow < 0) newRow = rows - 1;
                let newIndex = newRow * this.cols + col;
                if (newIndex >= currentItemsLength) {
                    newIndex = Math.max(newIndex - this.cols, 0);
                }
                selectedIndex = newIndex;
                break;

            case "DOWN":
                row = (row + 1) % rows;
                selectedIndex = row * this.cols + col;
                break;

            case "LEFT":
                if (col === 0) {
                    const prevRow = row;
                    if (currentPage > 0) {
                        currentPage--;
                    } else {
                        currentPage = totalPages - 1;
                    }
                    // ページ切り替え後のアイテム数で再計算
                    const newItemsLength = getItemsCount(currentPage);
                    const newRows = Math.floor(newItemsLength / this.cols);
                    row = Math.min(prevRow, newRows - 1);
                    col = 1;
                } else {
                    col = 0;
                }
                selectedIndex = row * this.cols + col;
                break;

            case "RIGHT":
                if (col === 1) {
                    const prevRow = row;
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                    } else {
                        currentPage = 0;
                    }
                    const newItemsLength = getItemsCount(currentPage);
                    const newRows = Math.ceil(newItemsLength / this.cols);
                    row = Math.min(prevRow, newRows - 1);
                    col = 0;
                } else {
                    if (currentItemsLength === 1) {
                        const prevRow = row;
                        if (currentPage < totalPages - 1) {
                            currentPage++;
                        } else {
                            currentPage = 0;
                        }
                        const newItemsLength = getItemsCount(currentPage);
                        const newRows = Math.ceil(newItemsLength / this.cols);
                        row = Math.min(prevRow, newRows - 1);
                        col = 0;
                        // カーソルの移動先にアイテムがない場合
                    } else if (selectedIndex + 1 >= currentItemsLength) {
                        // カーソルを右上のアイテムに移動
                        return { selectedIndex: selectedIndex - 1, currentPage, isChanged: true };
                    } else {
                        col = 1;
                    }
                }
                selectedIndex = row * this.cols + col;
                break;
        }

        // 最後の範囲チェック
        if (selectedIndex >= getItemsCount(currentPage)) {
            selectedIndex = getItemsCount(currentPage) - 1;
        }
        if (selectedIndex < 0) selectedIndex = 0;

        return { selectedIndex, currentPage, isChanged: true };
    }
}