import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ChatHistoryGetOneRequest, ChatHistoryRequest, ChatHistoryResponse } from 'src/model/chat_history.model';
import { ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('/api/v1/chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) { }

  @Post('/add')
  @HttpCode(200)
  @ApiBody({
    type: ChatHistoryRequest,
    schema: {
      properties: {
        sessionId: { type: 'string' },
        historyName: { type: 'string' },
      },
      required: ['sessionId', 'historyName']
    },
    examples: {
      'example 1': {
        value: {
          sessionId: 'string',
          historyName: 'string'
        }
      }
    }
  })
  async create(
    @Body() req: ChatHistoryRequest
  ): Promise<ChatHistoryResponse> {
    return this.chatHistoryService.create(req);
  }

  @Get('/get-one')
  @HttpCode(200)
  @ApiQuery({
    name: 'sessionId',
    required: true,
    type: String,
  })
  async get(
    @Query() req: ChatHistoryGetOneRequest
  ): Promise<ChatHistoryResponse> {
    return this.chatHistoryService.get(req);
  }

  @Get('/get-all')
  async getAll(): Promise<ChatHistoryResponse[]> {
    return this.chatHistoryService.getAll();
  }
}
