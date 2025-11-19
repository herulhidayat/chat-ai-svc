import { Module } from '@nestjs/common';
import { LlmClientService } from './llm-client.service';
import { LlmClientController } from './llm-client.controller';
import { CommonModule } from 'src/common/common.module';
import { ChromaModule } from 'src/chroma/chroma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [CommonModule, ChromaModule, HttpModule],
  controllers: [LlmClientController],
  providers: [LlmClientService],
})
export class LlmClientModule {}
