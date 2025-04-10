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

    // Positions
    rightHandPosX: DataTypes.FLOAT,
    rightHandPosY: DataTypes.FLOAT,
    rightHandPosZ: DataTypes.FLOAT,
    leftHandPosX: DataTypes.FLOAT,
    leftHandPosY: DataTypes.FLOAT,
    leftHandPosZ: DataTypes.FLOAT,
    headPosX: DataTypes.FLOAT,
    headPosY: DataTypes.FLOAT,
    headPosZ: DataTypes.FLOAT,
    eyeTrackerPosX: DataTypes.FLOAT,
    eyeTrackerPosY: DataTypes.FLOAT,
    eyeTrackerPosZ: DataTypes.FLOAT,
    eyeTrackerDirX: DataTypes.FLOAT,
    eyeTrackerDirY: DataTypes.FLOAT,
    eyeTrackerDirZ: DataTypes.FLOAT,

    // Rotations
    rightHandRotPitch: DataTypes.FLOAT,
    rightHandRotYaw: DataTypes.FLOAT,
    rightHandRotRoll: DataTypes.FLOAT,
    leftHandRotPitch: DataTypes.FLOAT,
    leftHandRotYaw: DataTypes.FLOAT,
    leftHandRotRoll: DataTypes.FLOAT,
    headRotPitch: DataTypes.FLOAT,
    headRotYaw: DataTypes.FLOAT,
    headRotRoll: DataTypes.FLOAT,
  });

  return SessionData;
};
