const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/database.config");

const env = process.env.NODE_ENV || "development";
const sequelize = new Sequelize(config[env]);

// Import models
const CsvFile = require("./csv-file")(sequelize, DataTypes);
const Position = require("./position")(sequelize, DataTypes);
const Rotation = require("./rotation")(sequelize, DataTypes);
const SessionData = require("./session-data")(sequelize, DataTypes);

// Define associations
CsvFile.hasMany(SessionData);
SessionData.belongsTo(CsvFile);

module.exports = {
  sequelize,
  CsvFile,
  Position,
  Rotation,
  SessionData,
};
