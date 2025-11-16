import { PrismaClient } from '@prisma/client';
import { Logger } from 'winston';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }

  onModuleInit() {
    const on = this.$on.bind(this) as (
      event: 'info' | 'warn' | 'error' | 'query',
      callback: (event: unknown) => void,
    ) => void;

    on('info', (e) => {
      this.logger.info(e);
    });
    on('warn', (e) => {
      this.logger.warn(e);
    });
    on('error', (e) => {
      this.logger.error(e);
    });
    on('query', (e) => {
      this.logger.info(e);
    });
  }
}
