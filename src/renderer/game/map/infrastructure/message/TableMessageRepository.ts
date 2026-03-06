// infrastructure/message/TableMessageRepository.ts

import { messageTable } from "../../../../../shared/data/message/messageTable";
import { MessageRepository } from "../../interaction/application/message/MessageRepository";

export class TableMessageRepository implements MessageRepository {

    getMessage(id: string): string | undefined {
        return messageTable[id];
    }
}
