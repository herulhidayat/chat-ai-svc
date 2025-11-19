import { Module } from '@nestjs/common';
import { ChromaService } from './chroma.service';
import { ChromaClient } from 'chromadb';

@Module({
  providers: [
    {
      provide: ChromaClient,
      useFactory: () => {
        // default: http://localhost:8000, sesuaikan dengan env
        const client = new ChromaClient({
          path: process.env.CHROMA_URL || 'http://localhost:8000',
        });

        return client;
      },
    },
    ChromaService
  ],
  exports: [ChromaService]
})
export class ChromaModule {}
