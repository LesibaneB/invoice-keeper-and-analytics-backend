export interface EmailPayload {
    readonly to: string;
    readonly subject: string;
    readonly payload: MessagePayload;
    readonly templateName: string;
}

interface MessagePayload {
    readonly receipient: string;
    readonly code: number;
}