import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LlmClientService } from './llm-client.service';
import { ChatRequest } from 'src/model/llm.model';
import { WebResponse } from 'src/model/web.model';
import { ApiBody } from '@nestjs/swagger';

@Controller('/api/v1/llm-client')
export class LlmClientController {
  constructor(
    private llmClientService: LlmClientService
  ) { }

  @Post('/chat')
  @HttpCode(200)
  @ApiBody({
    type: ChatRequest,
    schema: {
      properties: {
        question: { type: 'string' },
        docId: { type: 'string' },
        sessionId: { type: 'string' },
      },
      required: ['question']
    },
    examples: {
      'example 1': {
        value: {
          question: 'Berdasarkan dokumen yang diberikan, berikan ringkasan dari dokumen tersebut',
          docId: 'string',
          sessionId: 'string'
        }
      }
    }
  })
  async chat(
    @Body() request: ChatRequest
  ): Promise<WebResponse<any>> {
    const result = await this.llmClientService.generatePrompt(request);

    return {
      data: result,
    }
  }
}
