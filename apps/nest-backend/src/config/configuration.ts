export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  // 内网 Python AI 服务
  aiService: {
    baseUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
    internalToken: process.env.AI_SERVICE_TOKEN ?? 'dev-internal-token',
    timeoutMs: parseInt(process.env.AI_SERVICE_TIMEOUT_MS ?? '120000', 10),
  },

  // 会话/用户存储
  database: {
    url: process.env.DATABASE_URL ?? './data/nest.db',
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  },

  // 鉴权
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
    adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
    adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
  },

  // 上传限制
  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '50', 10),
    allowedExtensions: ['.pdf', '.md', '.txt', '.docx'],
  },
});
