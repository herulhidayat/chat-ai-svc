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
    async create({ sessionId, historyName }: ChatHistoryRequest): Promise<ChatHistoryResponse> {
        const chatHistory = await this.prismaService.chatHistory.create({
            data: {
                sessionId: sessionId,
                historyName: historyName
            }
        });

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>", chatHistory)

        return {
            sessionId: chatHistory.sessionId,
            historyName: chatHistory.historyName,
            data: null,
        }
    }

    async get({ sessionId }: ChatHistoryGetOneRequest): Promise<ChatHistoryResponse> {
        const data = await this.redisService.get<Array<{ role: string; content: string }>>(this.buildChatKey(sessionId));
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>", data)
        const chatHistory = await this.prismaService.chatHistory.findUnique({
            where: {
                sessionId: sessionId
            }
        });

        return {
            sessionId: sessionId,
            historyName: chatHistory?.historyName || '',
            data: data,
        }
    }

    async getAll(): Promise<ChatHistoryResponse[]> {
        const chatHistories = await this.prismaService.chatHistory.findMany();
        return chatHistories.map((chatHistory) => ({
            sessionId: chatHistory.sessionId,
            historyName: chatHistory.historyName,
            data: null,
        }));
    }

    private buildChatKey(sessionId?: string) {
        return `chat:${sessionId}`;
    }
}
