import { HttpService } from '@nestjs/axios';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { lastValueFrom } from 'rxjs';
import { ChromaService } from 'src/chroma/chroma.service';
import { EmbedderService } from 'src/common/embedder.service';
import { ChatRequest } from 'src/model/llm.model';
import { RedisService } from 'src/redis/redis.service';
import { Logger } from 'winston';
import { randomUUID } from "crypto";
import { ChatHistoryService } from 'src/chat-history/chat-history.service';

@Injectable()
export class LlmClientService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
        private embedderService: EmbedderService,
        private chromaService: ChromaService,
        private readonly httpService: HttpService,
        private redisService: RedisService,
        private chatHistoryService: ChatHistoryService
    ) { }

    async generatePrompt(request: ChatRequest): Promise<any> {
        this.logger.debug(`LlmClientService.generatePrompt ${JSON.stringify(request)}`);

        if (request.question.length < 1) {
            throw new HttpException(
                `Prompt must be at least 1 character`,
                400
            )
        }

        let context: string = '';

        if (request?.docId) {
            const embedPrompt = await this.embedderService.embedText(request.question, 'http://10.12.120.32:8142/v1/embeddings');
            const searchSimilarity = await this.chromaService.searchSimilar(request?.docId, embedPrompt, 3);

            context = searchSimilarity?.documents?.[0]?.join('\n');
        }

        let sessionId: any = request.sessionId;
        if (!sessionId) {
            const uuid = await randomUUID();
            sessionId = uuid;

            await this.chatHistoryService.create({ sessionId: uuid, historyName: request.question });
        }

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>sessionID", sessionId)

        const key = this.buildChatKey(sessionId);
        const history = (await this.redisService.get<Array<{ role: string; content: string }>>(key)) || [];

        const messages: Array<{ role: string; content: string }> = [
            { role: "system", content: "You are a helpful assistant." },
            ...history,
        ];

        if (context) {
            messages.push({
                role: "user",
                content: `
                    You are a document assistant. Use the context below to answer the user's question. 

                    Context:\n${context}

                    Question:\n${request.question}
                `
            });
        } else {
            messages.push({ role: "user", content: request.question });
        }

        const response = await this.generateResponse(messages);

        const answer = response?.choices?.[0]?.message?.content;

        if (answer) {
            history.push({ role: 'user', content: request.question });
            history.push({ role: 'assistant', content: answer });
            await this.redisService.set(key, history, 60 * 60);
        }

        return {
            sessionId,
            answer
        };
    }

    async generateResponse(messages: Array<{ role: string; content: string }>): Promise<any> {
        try {
            const response = await lastValueFrom(
                this.httpService.post(
                    `${process.env.LLM_BASE_URL}`,
                    {
                        "model": "gpt-oss-20b",
                        "messages": messages
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.LLM_API_KEY}`,
                            'Content-Type': 'application/json',
                        }
                    }
                )
            )

            return response.data;
        } catch (error) {
            console.error('Error making external API call:', error);
            throw error;
        }
    }

    private buildChatKey(sessionId?: string) {
        return `chat:${sessionId}`;
    }


}
