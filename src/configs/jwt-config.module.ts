import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

const logger = new Logger('JwtConfigModule');

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret');
        if (!secret) {
          logger.warn('JWT secret is not defined. JWT authentication will not work.');
        }
        return { secret };
      },
      global: true,
      inject: [ConfigService],
    }),
  ],
})
export class JwtConfigModule {}
