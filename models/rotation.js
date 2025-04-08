module.exports = (sequelize, DataTypes) => {
  const CsvFile = require("./csv-file")(sequelize, DataTypes);

  const Rotation = sequelize.define("Rotation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pitch: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    yaw: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    roll: {
      type: DataTypes.FLOAT,
      allowNull: false,
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

  return Rotation;
};
