const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Management Platform API',
      version: '1.0.0',
      description: 'API documentation for the Course Management Platform backend service.',
    },
    servers: [
      {
        url: 'http://localhost:3001/api', // Adjust base URL as needed
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };