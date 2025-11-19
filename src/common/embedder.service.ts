import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';

type EmbeddingRecord = {
    id: string;
    text: string;
    embedding: number[];
};

@Injectable()
export class EmbedderService {
    constructor(
        private readonly httpService: HttpService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger
    ) {}

    async embedBatch(textChunks: string[], url: string, doc_id: string): Promise<{
        data: EmbeddingRecord[];
        metaData: { doc_id: string };
    }> {
        try {
            const response = await Promise.all(
                textChunks.map(async (text: string, index: number) => {
                    if (!(text && text.trim().length > 0)) {
                        return null;
                    }
                    const embedded = await this.embedText(text, url);
                    if (!embedded) {
                        return null;
                    }
                    return {
                        id: `${doc_id}-${index}`,
                        text,
                        embedding: embedded,
                    } satisfies EmbeddingRecord;
                })
            );

            return {
                data: response.filter(
                    (record): record is EmbeddingRecord => record !== null
                ),
                metaData: {
                    doc_id,
                },
            };
        } catch (error) {
            console.error('Error making external API call:', error);
            throw error;
        }
    }

    async embedText(text: string, url: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    url, 
                    {
                        input: text,
                        model: "ebbge-m3",
                    }
                )
            );
            return response.data?.data?.[0]?.embedding; 
        } catch (error) {
            console.error('Error making external API call:', error);
            throw error;
        }
    }
}
