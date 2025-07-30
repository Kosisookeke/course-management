const Redis = require('ioredis');

let redisClient;

const createRedisConnection = () => {
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    connectTimeout: 10000,
    commandTimeout: 5000,
  };

  return new Redis(redisConfig);
};

const initializeRedis = async () => {
  try {
    redisClient = createRedisConnection();

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis ready for operations');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    redisClient.on('close', () => {
      console.log('⚠️ Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    // Test connection
    await redisClient.connect();
    await redisClient.ping();
    console.log('✅ Redis connection test successful');

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
};

const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  closeRedisConnection,
  redisClient: () => redisClient
};