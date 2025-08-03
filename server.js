const app = require('./app');
const { sequelize } = require('./models');
const { initializeRedis } = require('./services/redisService');
const notificationQueueService = require('./services/notificationQueueService');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    try {
      await initializeRedis();
      console.log('✅ Redis connection established successfully.');

      await notificationQueueService.initialize();
      console.log('✅ Notification queue service initialized successfully.');
    } catch (redisError) {
      console.warn('⚠️ Redis/Notification system failed to initialize:', redisError.message);
      console.warn('⚠️ Server will continue without notification features');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation available at: http://localhost:${PORT}/api-docs`);
      console.log(`🔔 Notification system: ${notificationQueueService.initialized ? 'Active' : 'Disabled'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  try {
    await notificationQueueService.cleanup();
    await sequelize.close();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  try {
    await notificationQueueService.cleanup();
    await sequelize.close();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();