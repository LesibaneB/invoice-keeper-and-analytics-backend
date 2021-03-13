export interface EmailPayload {
    readonly to: string;
    readonly subject: string;
    readonly payload: MessagePayload;
    readonly templateName: string;
}

interface MessagePayload {
    readonly recipient: string;
    readonly code: number;
}