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
        url: 'http://localhost:3000/api', // Development server URL
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            email: {
              type: 'string',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['manager', 'facilitator', 'student'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Module: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Module ID'
            },
            name: {
              type: 'string',
              description: 'Module name'
            },
            code: {
              type: 'string',
              description: 'Module code'
            }
          }
        },
        Class: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Class ID'
            },
            name: {
              type: 'string',
              description: 'Class name'
            }
          }
        },
        Cohort: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Cohort ID'
            },
            name: {
              type: 'string',
              description: 'Cohort name'
            }
          }
        },
        Mode: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Mode ID'
            },
            name: {
              type: 'string',
              description: 'Delivery mode name (online, in-person, hybrid)'
            }
          }
        },
        CourseOffering: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Course offering ID'
            },
            moduleId: {
              type: 'integer',
              description: 'Module ID'
            },
            classId: {
              type: 'integer',
              description: 'Class ID'
            },
            trimester: {
              type: 'string',
              enum: ['T1', 'T2', 'T3'],
              description: 'Trimester'
            },
            cohortId: {
              type: 'integer',
              description: 'Cohort ID'
            },
            intake: {
              type: 'string',
              enum: ['HT1', 'HT2', 'FT'],
              description: 'Intake type'
            },
            modeId: {
              type: 'integer',
              description: 'Delivery mode ID'
            },
            facilitatorId: {
              type: 'integer',
              description: 'Facilitator ID'
            },
            module: {
              $ref: '#/components/schemas/Module'
            },
            class: {
              $ref: '#/components/schemas/Class'
            },
            cohort: {
              $ref: '#/components/schemas/Cohort'
            },
            mode: {
              $ref: '#/components/schemas/Mode'
            },
            facilitator: {
              $ref: '#/components/schemas/User'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        ActivityTracker: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Activity tracker ID'
            },
            allocationId: {
              type: 'integer',
              description: 'Course offering ID'
            },
            weekNumber: {
              type: 'integer',
              description: 'Week number'
            },
            attendance: {
              type: 'array',
              items: {
                type: 'boolean'
              },
              description: 'Array of attendance records'
            },
            formativeOneGrading: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started'],
              description: 'Status of formative assessment 1 grading'
            },
            formativeTwoGrading: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started'],
              description: 'Status of formative assessment 2 grading'
            },
            summativeGrading: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started'],
              description: 'Status of summative assessment grading'
            },
            courseModeration: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started'],
              description: 'Status of course moderation'
            },
            intranetSync: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started'],
              description: 'Status of intranet synchronization'
            },
            gradeBookStatus: {
              type: 'string',
              enum: ['Done', 'Pending', 'Not Started'],
              description: 'Status of grade book'
            },
            courseOffering: {
              $ref: '#/components/schemas/CourseOffering'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        File: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'File name on the server'
            },
            originalname: {
              type: 'string',
              description: 'Original file name'
            },
            mimetype: {
              type: 'string',
              description: 'MIME type of the file'
            },
            size: {
              type: 'integer',
              description: 'File size in bytes'
            },
            path: {
              type: 'string',
              description: 'File path on the server'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp'
            }
          }
        }
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