// models/Member.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Member extends Model {}

Member.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    role: { type: DataTypes.ENUM('member', 'admin'), allowNull: false, defaultValue: 'member' },
    planId: { type: DataTypes.INTEGER, allowNull: true, field: 'plan_id' },
  },
  { sequelize, modelName: 'Member', tableName: 'members' }
);

module.exports = Member;
