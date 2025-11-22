export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
    username: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? 'password',
    database: process.env.DATABASE_NAME ?? 'easycoach',
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
