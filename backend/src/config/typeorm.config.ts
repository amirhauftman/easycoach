import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const createTypeOrmOptions = (config: ConfigService) =>
({
  type: 'postgres',
  url: config.get('database.url'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
} as TypeOrmModuleOptions);
