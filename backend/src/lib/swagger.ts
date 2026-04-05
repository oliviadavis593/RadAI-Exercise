import swaggerJSDoc from 'swagger-jsdoc'
import path from 'path'

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SF Food Facility API',
      version: '1.0.0',
      description:
        'REST API for searching San Francisco Mobile Food Facility Permit data. ' +
        'Data sourced from the SF Open Data portal.',
      contact: { name: 'RadAI Exercise' },
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
    ],
  },
  // Support both TypeScript source (ts-node dev) and compiled JS (production).
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
  ],
})
