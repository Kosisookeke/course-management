const redis = require('redis');

const createMockRedisClient = () => {
  return {
    isReady: false,
    isConnected: () => false,
    connect: async () => {
      throw new Error('Redis not available');
    },
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    on: () => {},
    off: () => {},
    quit: async () => 'OK'
  };
};

let redisClient;

try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 5000,
      lazyConnect: true
    }
  });

  redisClient.on('error', (err) => {
    console.warn('Redis Client Error (continuing without Redis):', err.message);
  });

  redisClient.isConnected = () => {
    return redisClient.isReady;
  };

} catch (error) {
  console.warn('Redis initialization failed, using mock client:', error.message);
  redisClient = createMockRedisClient();
}

module.exports = redisClient;