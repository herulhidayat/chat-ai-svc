export class ChatHistoryRequest {
    sessionId: string;
    historyName: string;
}

export class ChatHistoryGetOneRequest {
    sessionId: string;
}

export class ChatHistoryResponse {
    sessionId: string;
    historyName: string;
    data: any;
}