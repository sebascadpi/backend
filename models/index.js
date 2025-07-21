const { Sequelize, DataTypes } = require("sequelize");
const { DATABASE_CONFIG } = require("../constants/database");

const env = process.env.NODE_ENV || "development";
const sequelize = new Sequelize(DATABASE_CONFIG[env]);

// Import models
const CsvFile = require("./csv-file")(sequelize, DataTypes);
const SessionData = require("./session-data")(sequelize, DataTypes);

// Define associations
CsvFile.hasMany(SessionData);
SessionData.belongsTo(CsvFile);

module.exports = {
  sequelize,
  CsvFile,
  SessionData,
};
