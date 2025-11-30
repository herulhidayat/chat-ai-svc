import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { ChatHistoryGetOneRequest, ChatHistoryRequest, ChatHistoryResponse } from 'src/model/chat_history.model';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ChatHistoryService {
    constructor(
        private redisService: RedisService,
        private prismaService: PrismaService
    ) { }
    async create({ session_id, history_name }: ChatHistoryRequest): Promise<ChatHistoryResponse> {
        const chatHistory = await this.prismaService.chatHistory.create({
            data: {
                session_id: session_id,
                history_name: history_name
            }
        });

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>", chatHistory)

        return {
            session_id: chatHistory.session_id,
            history_name: chatHistory.history_name,
            data: null,
        }
    }

    async get({ session_id }: ChatHistoryGetOneRequest): Promise<ChatHistoryResponse> {
        const data = await this.redisService.get<Array<{ role: string; content: string }>>(this.buildChatKey(session_id));
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>", data)
        const chatHistory = await this.prismaService.chatHistory.findUnique({
            where: {
                session_id: session_id
            }
        });

        return {
            session_id: session_id,
            history_name: chatHistory?.history_name || '',
            data: data,
        }
    }

    async getAll(): Promise<ChatHistoryResponse[]> {
        const chatHistories = await this.prismaService.chatHistory.findMany();
        return chatHistories.map((chatHistory) => ({
            session_id: chatHistory.session_id,
            history_name: chatHistory.history_name,
            data: null,
        }));
    }

    private buildChatKey(session_id?: string) {
        return `chat:${session_id}`;
    }
}
