const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'PiknGo API',
      version: '1.0.0',
      description: 'API documentation for PiknGo - A platform connecting users with service providers',
      contact: {
        name: 'API Support',
        email: 'support@pikngo.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.pikngo.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management endpoints'
      },
      {
        name: 'Profile',
        description: 'User profile management endpoints'
      },
      {
        name: 'Tasks',
        description: 'Task creation and management endpoints'
      },
      {
        name: 'Payments',
        description: 'Payment processing endpoints'
      },
      {
        name: 'Notifications',
        description: 'User notification endpoints'
      },
      {
        name: 'Recommendations',
        description: 'Task matching and recommendation endpoints'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the user'
            },
            fullName: {
              type: 'string',
              description: 'Full name of the user'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user'
            },
            phone: {
              type: 'string',
              description: 'Phone number of the user'
            },
            role: {
              type: 'string',
              enum: ['user', 'doer', 'admin'],
              description: 'Role of the user in the system'
            },
            emailVerified: {
              type: 'boolean',
              description: 'Whether the email has been verified'
            },
            phoneVerified: {
              type: 'boolean',
              description: 'Whether the phone number has been verified'
            },
            profilePhoto: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                verified: { type: 'boolean' },
                publicId: { type: 'string' }
              }
            },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', default: 'Point' },
                coordinates: { 
                  type: 'array',
                  items: { type: 'number' }
                },
                address: { type: 'string' },
                city: { type: 'string' },
                country: { type: 'string' }
              }
            },
            spokenLanguages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  language: { type: 'string' },
                  proficiency: { type: 'string' }
                }
              }
            },
            preferredPaymentMethods: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['bank_transfer', 'mobile_money', 'cash']
              }
            },
            paymentDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['bank', 'mobile_money'] },
                  accountNumber: { type: 'string' },
                  bankName: { type: 'string' },
                  accountName: { type: 'string' },
                  mobileMoneyProvider: { type: 'string' },
                  mobileMoneyNumber: { type: 'string' }
                }
              }
            },
            doerProfile: {
              type: 'object',
              properties: {
                skills: {
                  type: 'array',
                  items: { type: 'string' }
                },
                services: {
                  type: 'array',
                  items: { 
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'number' }
                    }
                  }
                },
                availability: {
                  type: 'object',
                  properties: {
                    days: { type: 'array', items: { type: 'string' } },
                    hours: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['pending', 'in-progress', 'completed', 'cancelled']
            },
            creator: { 
              type: 'string',
              description: 'User ID of the task creator'
            },
            assignedTasker: {
              type: 'string',
              description: 'User ID of the assigned tasker'
            },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', default: 'Point' },
                coordinates: { 
                  type: 'array',
                  items: { type: 'number' }
                },
                address: { type: 'string' }
              }
            },
            requiredSkills: {
              type: 'array',
              items: { type: 'string' }
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  publicId: { type: 'string' }
                }
              }
            },
            price: { type: 'number' },
            paymentStatus: { 
              type: 'string',
              enum: ['pending', 'paid', 'refunded']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded']
            },
            paymentMethod: { 
              type: 'string',
              enum: ['mobile_money', 'bank_transfer', 'cash']
            },
            task: { type: 'string' },
            payer: { type: 'string' },
            payee: { type: 'string' },
            transactionId: { type: 'string' },
            transactionReference: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            recipient: { type: 'string' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'object' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    }
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

// Add custom CSS to improve the Swagger UI appearance
const customCss = `
  .swagger-ui .topbar { background-color: #1a365d; }
  .swagger-ui .info .title { color: #1a365d; }
  .swagger-ui .opblock.opblock-post { background: rgba(73, 204, 144, 0.1); }
  .swagger-ui .opblock.opblock-get { background: rgba(97, 175, 254, 0.1); }
  .swagger-ui .opblock.opblock-put { background: rgba(252, 161, 48, 0.1); }
  .swagger-ui .opblock.opblock-delete { background: rgba(249, 62, 62, 0.1); }
  .swagger-ui .opblock.opblock-patch { background: rgba(80, 227, 194, 0.1); }
`;

// Setup Swagger UI with custom options
const swaggerUiOptions = {
  explorer: true,
  customCss,
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    tagsSorter: 'alpha'
  }
};

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, swaggerUiOptions),
  specs,
};
