// config/db.js
// Configuracion de conexion a PostgreSQL via Sequelize
const { Sequelize } = require('sequelize');

// Debug: Verificar variables de entorno
console.log('=== DEBUG VARIABLES DE ENTORNO ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***CONFIGURADO***' : 'NO CONFIGURADO');
console.log('DB_PORT:', process.env.DB_PORT);
console.log('=====================================');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

module.exports = sequelize;