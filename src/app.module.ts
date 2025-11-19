import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ChromaModule } from './chroma/chroma.module';
import { LlmClientModule } from './llm-client/llm-client.module';

@Module({
  imports: [CommonModule, UserModule, FileUploadModule, ChromaModule, LlmClientModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
