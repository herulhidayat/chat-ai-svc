import { Module } from '@nestjs/common';
import { LlmClientService } from './llm-client.service';
import { LlmClientController } from './llm-client.controller';
import { CommonModule } from 'src/common/common.module';
import { ChromaModule } from 'src/chroma/chroma.module';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from 'src/redis/redis.module';
import { ChatHistoryModule } from 'src/chat-history/chat-history.module';

@Module({
  imports: [CommonModule, ChromaModule, HttpModule, RedisModule, ChatHistoryModule],
  controllers: [LlmClientController],
  providers: [LlmClientService],
})
export class LlmClientModule { }
