module.exports = (sequelize, DataTypes) => {
  const CsvFile = sequelize.define("CsvFile", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return CsvFile;
};
