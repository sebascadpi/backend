module.exports = (sequelize, DataTypes) => {
  const CsvFile = require("./csv-file")(sequelize, DataTypes);
  const SessionData = sequelize.define("SessionData", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rightHandObject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    leftHandObject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    objectPut: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    totalErrors: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rowIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CsvFileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CsvFile,
        key: "id",
      },
    },
  });

  return SessionData;
};
