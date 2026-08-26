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

// Cabeceras de seguridad (mitiga varios vectores: clickjacking, sniffing, etc.)
// Configurado para permitir scripts inline necesarios para el frontend
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS
app.use(
  cors({
    origin: '*', // Permitir cualquier origen para evitar problemas CORS
    credentials: true, // necesario para que el navegador mande la cookie de sesion
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use(generalLimiter);
// app.use(verifyCsrf); // CSRF deshabilitado para API REST

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/', routes);

// Servir archivos estáticos del frontend (después de rutas API)
// Configurar cache-control para evitar cache agresivo en desarrollo
app.use(express.static(path.join(__dirname, '../../frontend'), {
  maxAge: 0, // No cache en desarrollo
  etag: false, // Deshabilitar ETag para evitar cache
  lastModified: false, // Deshabilitar Last-Modified para evitar cache
  setHeaders: (res, filePath) => {
    // Para HTML: no cache
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // Para CSS/JS: cache corto (5 minutos)
    else if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
    // Para imágenes: cache medio (1 hora)
    else if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    // Para otros archivos: cache corto (10 minutos)
    else {
      res.setHeader('Cache-Control', 'public, max-age=600');
    }
  }
}));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
