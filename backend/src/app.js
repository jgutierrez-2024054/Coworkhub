// app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const routes = require('./routes');
const sanitizeInput = require('./middlewares/sanitize');
const { verifyCsrf } = require('./middlewares/csrf');
const { generalLimiter } = require('./middlewares/rateLimit');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const swaggerSpec = require('./config/swagger');

const app = express();

// Configurar trust proxy para Render (proxy reverso)
// Usar 1 en lugar de true para evitar advertencias de seguridad
app.set('trust proxy', 1);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Cabeceras de seguridad (mitiga varios vectores: clickjacking, sniffing, etc.)
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || ['http://localhost:4000', 'http://localhost:5173', 'http://192.168.0.9:5173', 'http://192.168.100.85:5173', 'https://*.ngrok-free.dev', 'https://*.ngrok.dev', 'https://*.vercel.app'],
    credentials: true, // necesario para que el navegador mande la cookie de sesion
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use(generalLimiter);
// app.use(verifyCsrf); // Temporalmente deshabilitado para pruebas en producción

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
