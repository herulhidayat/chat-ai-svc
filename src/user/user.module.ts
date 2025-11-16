import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
    imports: [CommonModule],
    providers: [UserService],
    controllers: [UserController],
})
export class UserModule {}
