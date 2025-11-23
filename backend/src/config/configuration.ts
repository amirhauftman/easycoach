import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  API_BASE_URL: Joi.string().uri().default('https://ifa.easycoach.club/en/api/v3/analytics'),
  API_TOKEN: Joi.string().allow('').default(''),
  CACHE_TTL: Joi.number().default(1800000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
});

export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  api: {
    baseUrl: process.env.API_BASE_URL ?? 'https://ifa.easycoach.club/en/api/v3/analytics',
    token: process.env.API_TOKEN ?? '',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL ?? '1800000', 10), // 30 minutes in milliseconds
  },
  frontend: {
    url: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  },
});
