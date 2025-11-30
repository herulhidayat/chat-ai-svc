export class ChatHistoryRequest {
    session_id: string;
    history_name: string;
}

export class ChatHistoryGetOneRequest {
    session_id: string;
}

export class ChatHistoryResponse {
    session_id: string;
    history_name: string;
    data: any;
}