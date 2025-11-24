import { Module } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ChatHistoryController } from './chat-history.controller';
import { CommonModule } from 'src/common/common.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [ChatHistoryController],
  providers: [ChatHistoryService],
  imports: [CommonModule, RedisModule],
  exports: [ChatHistoryService],
})
export class ChatHistoryModule { }
