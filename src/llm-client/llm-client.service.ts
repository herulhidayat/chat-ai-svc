import { HttpService } from '@nestjs/axios';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { lastValueFrom } from 'rxjs';
import { ChromaService } from 'src/chroma/chroma.service';
import { EmbedderService } from 'src/common/embedder.service';
import { ChatRequest } from 'src/model/llm.model';
import { Logger } from 'winston';

@Injectable()
export class LlmClientService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
        private embedderService: EmbedderService,
        private chromaService: ChromaService,
        private readonly httpService: HttpService,
    ) {}

    async generatePrompt(request: ChatRequest): Promise<any> {
        this.logger.debug(`LlmClientService.generatePrompt ${JSON.stringify(request)}`);

        if(request.question.length < 1) {
            throw new HttpException(
                `Prompt must be at least 1 character`,
                400
            )
        }

        let context: string = '';

        if(request?.docId) {
            const embedPrompt = await this.embedderService.embedText(request.question, 'http://10.12.120.32:8142/v1/embeddings');
            const searchSimilarity = await this.chromaService.searchSimilar(request?.docId, embedPrompt, 3);

            context = searchSimilarity?.documents?.[0]?.join('\n');
        }

        const prompt = `
            You are a document assistant. Use the context below to answer the user's question. 

            Context:
            ${context}
            
            Question:
            ${request.question}
        `;

        const response = await this.generateResponse(prompt);

        return response;
    }

    async generateResponse(prompt: string): Promise<any> {
        try {
            const response = await lastValueFrom(
                this.httpService.post(
                    'http://10.12.120.43:8787/v1/chat/completions', 
                    {
                        "model": "gpt-oss-20b",
                        "messages": [
                            {"role": "system", "content": "You are a helpful assistant."},
                            {"role": "user", "content": prompt}
                        ]
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
}
