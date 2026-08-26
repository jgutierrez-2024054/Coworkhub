// server.js
require('dotenv').config();
const app = require('./app');
const { syncDatabase } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await syncDatabase();
    app.listen(PORT, () => {
      console.log(`CoWork Hub API escuchando en http://localhost:${PORT}`);
      console.log(`Documentacion Swagger en http://localhost:${PORT}/docs`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

// Iniciar servidor (Render usa servidor tradicional, no serverless)
start();
