const {
  CsvFile,
  Position,
  Rotation,
  SessionData,
  sequelize,
} = require("../models");
const { saveRow } = require("./csv-service");

const mockCsvRow = {
  Time: "0:0:220",
  RightHandObject: "Object1",
  LeftHandObject: "Object2",
  ObjectPut: 1,
  TotalErrors: 0,
  RightHandPos: "X=-3.899 Y=-4.542 Z=-28.549",
  LeftHandPos: "X=-3.899 Y=-4.542 Z=-28.549",
  HeadPos: "X=-3.899 Y=-4.542 Z=-28.549",
  EyeTrackerPos: "X=-3.899 Y=-4.542 Z=-28.549",
  EyeTrackerDir: "X=-3.899 Y=-4.542 Z=-28.549",
  RightHandRot: "P=-37.802132 Y=-166.741867 R=86.449875",
  LeftHandRot: "P=-37.802132 Y=-166.741867 R=86.449875",
  HeadRot: "P=-37.802132 Y=-166.741867 R=86.449875",
};

describe("Database Operations", () => {
  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      // Sync database - this creates the tables
      await sequelize.sync({ force: true });
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  });

  beforeEach(async () => {
    // Clean up data before each test
    await Position.destroy({ where: {} });
    await Rotation.destroy({ where: {} });
    await SessionData.destroy({ where: {} });
    await CsvFile.destroy({ where: {} });
  });

  test("saveRow should save all data correctly", async () => {
    const csvFile = await CsvFile.create({ fileName: "test.csv" });

    const saveRowResults = await saveRow(csvFile.id, 0, mockCsvRow);
    expect(saveRowResults).toBeTruthy();

    const sessionData = await SessionData.findOne({
      where: { CsvFileId: csvFile.id },
    });
    console.log(
      "\nSession Data:",
      JSON.stringify(sessionData.toJSON(), null, 2)
    );

    expect(sessionData).toBeTruthy();
    expect(sessionData.time).toBe(mockCsvRow.Time);
    expect(sessionData.rightHandObject).toBe(mockCsvRow.RightHandObject);

    // Verificar Position
    const positions = await Position.findAll({
      where: { CsvFileId: csvFile.id },
    });
    expect(positions.length).toBe(5);
    console.log(
      "\nPositions:",
      JSON.stringify(
        positions.map((p) => p.toJSON()),
        null,
        2
      )
    );

    // Verificar Rotation
    const rotations = await Rotation.findAll({
      where: { CsvFileId: csvFile.id },
    });
    expect(rotations.length).toBe(3);
    console.log(
      "\nRotations:",
      JSON.stringify(
        rotations.map((r) => r.toJSON()),
        null,
        2
      )
    );
  });

  afterAll(async () => {
    // Limpiar la base de datos después de los tests
    await Position.destroy({ where: {} });
    await Rotation.destroy({ where: {} });
    await SessionData.destroy({ where: {} });
    await CsvFile.destroy({ where: {} });
  });
});
