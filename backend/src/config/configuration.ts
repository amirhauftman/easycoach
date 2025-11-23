export default () => ({
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
