// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CoWork Hub API',
      version: '1.0.0',
      description: 'API de gestion de coworking: miembros, planes, espacios, reservas y reportes.',
    },
    servers: [{ url: '/' }],
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: process.env.COOKIE_NAME || 'cwh_session' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
