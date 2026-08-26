// models/index.js
// Define las asociaciones entre modelos y los indices que dan velocidad
// a las consultas cruzadas que el admin corre "todos los dias" (reportes
// filtrados por miembro, espacio y rango de fechas).
const sequelize = require('../config/db');
const Member = require('./Member');
const Plan = require('./Plan');
const Space = require('./Space');
const Reservation = require('./Reservation');

// Un miembro pertenece a un plan
Plan.hasMany(Member, { foreignKey: 'planId', as: 'members' });
Member.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

// Una reserva pertenece a un miembro y a un espacio
Member.hasMany(Reservation, { foreignKey: 'memberId', as: 'reservations' });
Reservation.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Space.hasMany(Reservation, { foreignKey: 'spaceId', as: 'reservations' });
Reservation.belongsTo(Space, { foreignKey: 'spaceId', as: 'space' });

async function syncDatabase() {
  await sequelize.sync();

  const qi = sequelize.getQueryInterface();
  const addIndexSafe = async (table, fields, options) => {
    try {
      await qi.addIndex(table, fields, options);
    } catch (err) {
      // El indice ya existe u otra condicion no critica: lo ignoramos.
    }
  };

  // Agregar columna image_url si no existe (para bases de datos existentes)
  try {
    const tableDescription = await qi.describeTable('spaces');
    if (!tableDescription.image_url) {
      await qi.addColumn('spaces', 'image_url', {
        type: sequelize.Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
      console.log('Columna image_url agregada a la tabla spaces');
    }
  } catch (err) {
    // La tabla no existe o ya tiene la columna
  }

  // Indices clave para reportes filtrados por espacio+rango de fechas
  // y por miembro+rango de fechas, y para detectar solapamientos rapido.
  await addIndexSafe('reservations', ['space_id', 'starts_at', 'ends_at'], {
    name: 'idx_reservations_space_range',
  });
  await addIndexSafe('reservations', ['member_id', 'starts_at'], {
    name: 'idx_reservations_member_start',
  });
  await addIndexSafe('members', ['email'], { unique: true, name: 'idx_members_email' });
}

module.exports = { sequelize, Member, Plan, Space, Reservation, syncDatabase };
