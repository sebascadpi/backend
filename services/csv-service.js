const { SessionData } = require("../models");
const { parseXYZ, parsePYR } = require("../utils/coords.utils");

exports.saveRow = async (CsvFileId, rowIndex, rowData) => {
  try {
    await SessionData.create({
      time: rowData.Time,
      rightHandObject: rowData.RightHandObject,
      leftHandObject: rowData.LeftHandObject,
      objectPut: rowData.ObjectPut,
      totalErrors: rowData.TotalErrors,
      rowIndex,
      CsvFileId,

      // Positions
      ...parseXYZ("rightHandPos", rowData.RightHandPos),
      ...parseXYZ("leftHandPos", rowData.LeftHandPos),
      ...parseXYZ("headPos", rowData.HeadPos),
      ...parseXYZ("eyeTrackerPos", rowData.EyeTrackerPos),
      ...parseXYZ("eyeTrackerDir", rowData.EyeTrackerDir),

      // Rotations
      ...parsePYR("rightHandRot", rowData.RightHandRot),
      ...parsePYR("leftHandRot", rowData.LeftHandRot),
      ...parsePYR("headRot", rowData.HeadRot),
    });

    return true;
  } catch (error) {
    console.error("Error saving row:", error);
    return false;
  }
};
