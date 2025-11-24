import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ChromaModule } from './chroma/chroma.module';
import { LlmClientModule } from './llm-client/llm-client.module';
import { RedisModule } from './redis/redis.module';
import { ChatHistoryModule } from './chat-history/chat-history.module';

@Module({
  imports: [CommonModule, UserModule, FileUploadModule, ChromaModule, LlmClientModule, RedisModule, ChatHistoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
