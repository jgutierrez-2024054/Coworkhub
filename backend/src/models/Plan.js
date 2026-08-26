// models/Plan.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Plan extends Model {}

Plan.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(80), allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    includedHours: { type: DataTypes.INTEGER, allowNull: false, field: 'included_hours' },
    // Tipos de espacio a los que da acceso este plan, ej: ["desk","meeting_room"]
    allowedSpaceTypes: { type: DataTypes.JSON, allowNull: false, field: 'allowed_space_types' },
  },
  { sequelize, modelName: 'Plan', tableName: 'plans' }
);

module.exports = Plan;
