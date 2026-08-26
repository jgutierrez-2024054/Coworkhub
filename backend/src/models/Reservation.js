// models/Reservation.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Reservation extends Model {}

Reservation.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    memberId: { type: DataTypes.INTEGER, allowNull: false, field: 'member_id' },
    spaceId: { type: DataTypes.INTEGER, allowNull: false, field: 'space_id' },
    startsAt: { type: DataTypes.DATE, allowNull: false, field: 'starts_at' },
    endsAt: { type: DataTypes.DATE, allowNull: false, field: 'ends_at' },
    hourlyRateSnapshot: {
      // Guardamos la tarifa vigente al momento de reservar: la facturacion
      // debe cuadrar con lo que realmente se reservo, aunque la tarifa cambie despues.
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'hourly_rate_snapshot',
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  { sequelize, modelName: 'Reservation', tableName: 'reservations' }
);

module.exports = Reservation;
