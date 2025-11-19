import { Injectable } from '@nestjs/common';
import { ChromaClient } from 'chromadb';

@Injectable()
export class ChromaService {
    constructor(
        private readonly chromaClient: ChromaClient,
    ) {}

    async addEmbeddings(doc_id: string, embeddings: any, chunks: any) {
        try {
            const collection = await this.chromaClient.getOrCreateCollection({
                name: doc_id,
            });

            await collection.add({
                ids: chunks.map((c: any) => c.id),
                documents: chunks.map((c: any) => c.text),
                embeddings,
            });

        } catch (error) {
            console.error('Failed to add embeddings', error);
        }
    }

    async searchSimilar(doc_id: string, query_embedding: any, top_k: number) {
        try {
            const collection = await this.chromaClient.getCollection({
                name: doc_id,
            });
            const result = await collection.query({
                queryEmbeddings: [query_embedding],
                nResults: top_k
            })
            return result;
        } catch (error) {
            console.error('Error making external API call:', error);
            throw error;
        }
    }
}
