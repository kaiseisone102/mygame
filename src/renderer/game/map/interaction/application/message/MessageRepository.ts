// application/message/MessageRepository.ts

export interface MessageRepository {
    getMessage(id: string): string | undefined;
}
