import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const createTypeOrmOptions = (config: ConfigService) =>
  ({
    type: 'mysql',
    host: config.get('database.host'),
    port: parseInt(config.get('database.port') as string, 10) || 3306,
    username: config.get('database.username'),
    password: config.get('database.password'),
    database: config.get('database.database'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
  } as TypeOrmModuleOptions);
