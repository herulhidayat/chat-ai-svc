import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ChromaModule } from './chroma/chroma.module';

@Module({
  imports: [CommonModule, UserModule, FileUploadModule, ChromaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
