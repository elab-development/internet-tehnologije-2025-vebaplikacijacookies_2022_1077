export const swaggerSpec = {
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
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Error message' },
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
          categoryId: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          orderNumber: { type: 'string' },
          status: { type: 'string' },
          totalAmount: { type: 'number' },
          shippingStreet: { type: 'string' },
          shippingCity: { type: 'string' },
        }
      }
    },
  },
  tags: [
    { name: 'Authentication', description: 'Autentifikacija korisnika' },
    { name: 'Products', description: 'Upravljanje proizvodima' },
    { name: 'Cart', description: 'Korpa za kupovinu' },
    { name: 'Orders', description: 'Narudžbine' },
    { name: 'User', description: 'Korisnički profil' },
    { name: 'Admin', description: 'Administratorske funkcije' }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Prijava korisnika',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'customer@example.com' },
                  password: { type: 'string', example: 'password123' },
                  rememberMe: { type: 'boolean', default: false }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Uspešna prijava' },
          '401': { description: 'Pogrešan email ili lozinka' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Registracija novog korisnika',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Uspešna registracija' }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        summary: 'Odjava korisnika',
        tags: ['Authentication'],
        responses: {
          '200': { description: 'Uspešna odjava' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Dohvatanje trenutnog korisnika',
        tags: ['Authentication'],
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Korisnik pronađen' },
          '401': { description: 'Niste prijavljeni' }
        }
      }
    },
    '/api/products': {
      get: {
        summary: 'Vraća listu proizvoda',
        tags: ['Products'],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 12 } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'categoryId', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Lista proizvoda' }
        }
      },
      post: {
        summary: 'Kreira novi proizvod (Admin only)',
        tags: ['Products'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Product'
              }
            }
          }
        },
        responses: {
          '201': { description: 'Proizvod kreiran' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/cart': {
      get: {
        summary: 'Vraća korpu trenutnog korisnika',
        tags: ['Cart'],
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Korpa za kupovinu' }
        }
      },
      post: {
        summary: 'Dodaje proizvod u korpu (ili menja količinu ako već postoji)',
        tags: ['Cart'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', default: 1 }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Proizvod dodat u korpu' }
        }
      }
    },
    '/api/orders': {
      get: {
        summary: 'Vraća listu narudžbina za trenutnog korisnika',
        tags: ['Orders'],
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Lista narudžbina' },
          '401': { description: 'Niste prijavljeni' }
        }
      },
      post: {
        summary: 'Kreira novu narudžbinu od stavki iz korpe',
        tags: ['Orders'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  shippingAddress: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      postalCode: { type: 'string' },
                      country: { type: 'string' }
                    }
                  },
                  paymentMethod: { type: 'string', example: 'CREDIT_CARD' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Narudžbina kreirana' },
          '400': { description: 'Prazna korpa ili greška' }
        }
      }
    },
    '/api/user/profile': {
      get: {
        summary: 'Dohvata profil trenutnog korisnika',
        tags: ['User'],
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Profil korisnika' }
        }
      },
      put: {
        summary: 'Ažurira profil korisnika',
        tags: ['User'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Profil ažuriran' }
        }
      }
    },
    '/api/admin/orders': {
      get: {
        summary: 'Vraća sve narudžbine (Admin only)',
        tags: ['Admin'],
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Sve narudžbine' }
        }
      }
    }
  }
};