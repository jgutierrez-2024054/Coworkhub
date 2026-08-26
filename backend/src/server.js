// server.js
require('dotenv').config();
const app = require('./app');
const { syncDatabase } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await syncDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`CoWork Hub API escuchando en http://0.0.0.0:${PORT}`);
      console.log(`Documentacion Swagger en http://0.0.0.0:${PORT}/docs`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

// Iniciar servidor (Render usa servidor tradicional, no serverless)
start();
