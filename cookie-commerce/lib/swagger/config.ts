import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cookie Commerce API',
      version: '1.0.0',
      description: 'E-commerce platforma sa naprednim cookie management sistemom',
      contact: {
        name: 'Cookie Commerce Team',
        email: 'support@cookiecommerce.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://cookie-commerce.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session_token',
          description: 'Session token stored in HttpOnly cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['GUEST', 'CUSTOMER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            currency: { type: 'string' },
            stock: { type: 'integer' },
            imageUrl: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Autentifikacija korisnika' },
      { name: 'Products', description: 'Upravljanje proizvodima' },
      { name: 'Cart', description: 'Korpa za kupovinu' },
      { name: 'Orders', description: 'Narudžbine' },
      { name: 'Admin', description: 'Administratorske funkcije' },
      { name: 'User', description: 'Korisnički profil' },
    ],
  },
  apis: ['./app/api/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);