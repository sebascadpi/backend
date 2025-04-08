module.exports = (sequelize, DataTypes) => {
  const CsvFile = require("./csv-file")(sequelize, DataTypes);

  const Position = sequelize.define("Position", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    x: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    y: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    z: {
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

  return Position;
};
