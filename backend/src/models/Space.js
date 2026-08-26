// models/Space.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Space extends Model {}

Space.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    type: {
      type: DataTypes.ENUM('desk', 'meeting_room', 'event_room'),
      allowNull: false,
    },
    capacity: { type: DataTypes.INTEGER, allowNull: false },
    hourlyRate: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'hourly_rate' },
    imageUrl: { type: DataTypes.STRING(255), allowNull: true, field: 'image_url', defaultValue: null },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: 'Space', tableName: 'spaces' }
);

module.exports = Space;
