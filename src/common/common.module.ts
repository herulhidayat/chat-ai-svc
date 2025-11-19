import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.services';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { AuthMiddleware } from './auth.middleware';
import { ExtractorService } from './extractor.service';
import { HttpModule } from '@nestjs/axios';
import { EmbedderService } from './embedder.service';

@Module({
    imports: [
        WinstonModule.forRoot({
            format: winston.format.json(),
            transports: [new winston.transports.Console()],
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        HttpModule
    ],
    providers: [PrismaService, ValidationService, ExtractorService, EmbedderService, {
        provide: APP_FILTER,
        useClass: ErrorFilter
    }],
    exports: [PrismaService, ValidationService, ExtractorService, EmbedderService],
})
export class CommonModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes('/api/v1/*');
    }
}
