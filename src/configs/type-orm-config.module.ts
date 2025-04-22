import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("db.host"),
        port: configService.get("db.port"),
        username: configService.get("db.username"),
        password: configService.get("db.password"),
        database: configService.get("db.database"),
        synchronize: configService.get("db.synchronize"),
        logging: configService.get("db.logging"),
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class TypeOrmConfigModule {}
