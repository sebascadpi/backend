const { SessionData, Position, Rotation } = require("../models");
const { parseXYZ, parsePYR } = require("../utils/parse");

exports.saveRow = async (CsvFileId, rowIndex, rowData) => {
  try {
    // Crear entrada de sesión
    await SessionData.create({
      time: rowData.Time,
      rightHandObject: rowData.RightHandObject,
      leftHandObject: rowData.LeftHandObject,
      objectPut: rowData.ObjectPut,
      totalErrors: rowData.TotalErrors,
      rowIndex,
      CsvFileId,
    });

    // Guardar posiciones
    await Position.bulkCreate([
      {
        type: "RightHand",
        ...parseXYZ(rowData.RightHandPos),
        rowIndex,
        CsvFileId,
      },
      {
        type: "LeftHand",
        ...parseXYZ(rowData.LeftHandPos),
        rowIndex,
        CsvFileId,
      },
      {
        type: "Head",
        ...parseXYZ(rowData.HeadPos),
        rowIndex,
        CsvFileId,
      },
      {
        type: "EyeTrackerPos",
        ...parseXYZ(rowData.EyeTrackerPos),
        rowIndex,
        CsvFileId,
      },
      {
        type: "EyeTrackerDir",
        ...parseXYZ(rowData.EyeTrackerDir),
        rowIndex,
        CsvFileId,
      },
    ]);

    // Guardar rotaciones
    await Rotation.bulkCreate([
      {
        type: "RightHand",
        ...parsePYR(rowData.RightHandRot),
        rowIndex,
        CsvFileId,
      },
      {
        type: "LeftHand",
        ...parsePYR(rowData.LeftHandRot),
        rowIndex,
        CsvFileId,
      },
      {
        type: "Head",
        ...parsePYR(rowData.HeadRot),
        rowIndex,
        CsvFileId,
      },
    ]);

    return true;
  } catch (error) {
    console.error("Error saving row:", error);
    return false;
  }
};
