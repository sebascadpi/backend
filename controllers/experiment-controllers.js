const { CsvFile, SessionData } = require("../models");
const { saveRow } = require("../services/csv-service");
const fs = require("fs");
const csvParser = require("csv-parser");
const {
  coordsToXYZ,
  rotCoordsToPYR,
  toCoordsObject,
  toRotCoordsObject,
} = require("../utils/coords.utils");
const { OBJECT_COLORS, DEFAULT_COLOR } = require("../constants/colors");
const { timeToMS } = require("../utils/time.utils");

exports.uploadExperimentCsv = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const csvFile = await CsvFile.create({
      fileName: req.file.originalname,
    });

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("error", (error) => {
        console.error("Error parsing CSV:", error);
        res.status(500).send("Error parsing CSV.");
      })
      .on("end", async () => {
        fs.unlinkSync(req.file.path);

        if (!results.length) {
          return res.status(400).send("No data found.");
        }

        try {
          for (let i = 0; i < results.length; i++) {
            const rawData = results[i];
            const [headers, values] = [
              Object.keys(rawData)[0].split(";"),
              Object.values(rawData)[0].split(";"),
            ];

            const parsedRow = headers.reduce((obj, header, index) => {
              obj[header] = values[index];
              return obj;
            }, {});

            const success = await saveRow(csvFile.id, i, parsedRow);
            if (!success) {
              throw new Error(`Error saving row ${i}`);
            }
          }

          res.json({
            message: "CSV saved successfully",
            fileId: csvFile.id,
            rowCount: results.length,
          });
        } catch (error) {
          console.error("Error saving data:", error);
          res.status(500).send("Error saving data");
        }
      });
  } catch (error) {
    console.error("Error in upload:", error);
    res.status(500).send("Internal server error");
  }
};

exports.getExperiments = async (req, res) => {
  try {
    const files = await CsvFile.findAll({
      include: [
        {
          model: SessionData,
          attributes: ["time", "objectPut", "totalErrors"],
          order: [["rowIndex", "ASC"]],
        },
      ],
    });

    const transformedFiles = files.map((file) => {
      const fileData = file.toJSON();
      const lastSession = fileData.SessionData[fileData.SessionData.length - 1];

      const totalTime = lastSession ? lastSession.time : "0:0:0";

      const totalErrors = lastSession.totalErrors || 0;
      const totalObjectsPut = lastSession.objectPut || 0;

      return {
        id: fileData.id,
        fileName: fileData.fileName,
        totalTime,
        totalObjectsPut,
        totalErrors,
        createdAt: fileData.createdAt,
        updatedAt: fileData.updatedAt,
      };
    });

    res.json(transformedFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Error fetching files");
  }
};

exports.getExperimentById = async (req, res) => {
  try {
    const file = await CsvFile.findByPk(req.params.id, {
      include: [
        {
          model: SessionData,
          order: [["rowIndex", "ASC"]],
        },
      ],
    });
    if (!file) return res.status(404).send("File not found");

    const parsedFile = file.toJSON();

    const experimentData = parsedFile.SessionData.map((data) => {
      // Positions
      const {
        rightHandPosX,
        rightHandPosY,
        rightHandPosZ,
        leftHandPosX,
        leftHandPosY,
        leftHandPosZ,
        headPosX,
        headPosY,
        headPosZ,
        eyeTrackerPosX,
        eyeTrackerPosY,
        eyeTrackerPosZ,
        eyeTrackerDirX,
        eyeTrackerDirY,
        eyeTrackerDirZ,
        rightHandRotPitch,
        rightHandRotYaw,
        rightHandRotRoll,
        leftHandRotPitch,
        leftHandRotYaw,
        leftHandRotRoll,
        headRotPitch,
        headRotYaw,
        headRotRoll,
        rightHandObject,
        leftHandObject,
        ...rest
      } = data;

      return {
        ...rest,
        // Hand Objects
        rightHandObject: rightHandObject === "None" ? null : rightHandObject,
        leftHandObject: leftHandObject === "None" ? null : leftHandObject,

        // Positions
        rightHandPos: coordsToXYZ(rightHandPosX, rightHandPosY, rightHandPosZ),
        leftHandPos: coordsToXYZ(leftHandPosX, leftHandPosY, leftHandPosZ),
        headPos: coordsToXYZ(headPosX, headPosY, headPosZ),
        eyeTrackerPos: coordsToXYZ(
          eyeTrackerPosX,
          eyeTrackerPosY,
          eyeTrackerPosZ
        ),
        eyeTrackerDir: coordsToXYZ(
          eyeTrackerDirX,
          eyeTrackerDirY,
          eyeTrackerDirZ
        ),

        // Rotations
        rightHandRot: rotCoordsToPYR(
          rightHandRotPitch,
          rightHandRotYaw,
          rightHandRotRoll
        ),
        leftHandRot: rotCoordsToPYR(
          leftHandRotPitch,
          leftHandRotYaw,
          leftHandRotRoll
        ),
        headRot: rotCoordsToPYR(headRotPitch, headRotYaw, headRotRoll),
      };
    });

    const fileData = {
      id: parsedFile.id,
      fileName: parsedFile.fileName.split(".")[0],
      createdAt: parsedFile.createdAt,
      updatedAt: parsedFile.updatedAt,
      experimentData,
    };

    res.json(fileData);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
};

exports.getExperimentViewById = async (req, res) => {
  try {
    const file = await CsvFile.findByPk(req.params.id, {
      include: [
        {
          model: SessionData,
          order: [["rowIndex", "ASC"]],
        },
      ],
    });
    if (!file) return res.status(404).send("File not found");
    const parsedFile = file.toJSON();

    const objectFirstAppearance = new Map();

    // Recorrer todos los datos de sesión para encontrar primeras apariciones
    parsedFile.SessionData.forEach((data) => {
      // Verificar mano derecha
      if (
        data.rightHandObject !== "None" &&
        !objectFirstAppearance.has(data.rightHandObject)
      ) {
        objectFirstAppearance.set(data.rightHandObject, {
          name: data.rightHandObject,
          posX: data.rightHandPosX,
          posY: data.rightHandPosY,
          posZ: data.rightHandPosZ,
          rotPitch: data.rightHandRotPitch,
          rotYaw: data.rightHandRotYaw,
          rotRoll: data.rightHandRotRoll,
        });
      }

      // Verificar mano izquierda
      if (
        data.leftHandObject !== "None" &&
        !objectFirstAppearance.has(data.leftHandObject)
      ) {
        objectFirstAppearance.set(data.leftHandObject, {
          name: data.leftHandObject,
          posX: data.leftHandPosX,
          posY: data.leftHandPosY,
          posZ: data.leftHandPosZ,
          rotPitch: data.leftHandRotPitch,
          rotYaw: data.leftHandRotYaw,
          rotRoll: data.leftHandRotRoll,
        });
      }
    });

    // Crear el array final de experimentObjects
    const experimentObjects = Array.from(objectFirstAppearance.values()).map(
      (obj) => {
        const { rotPitch, rotYaw, rotRoll } = obj;
        return {
          name: obj.name,
          color: OBJECT_COLORS[obj.name] || DEFAULT_COLOR,
          initialPosition: toCoordsObject(obj.posX, obj.posY, obj.posZ),
          initialRotation: toRotCoordsObject(rotPitch, rotYaw, rotRoll),
        };
      }
    );

    const lastSession =
      parsedFile.SessionData[parsedFile.SessionData.length - 1];

    // Calculate total time from the last SessionData entry
    const totalTime = timeToMS(lastSession ? lastSession.time : "0:0:0");

    const experimentData = parsedFile.SessionData.map((data) => {
      // Positions
      const {
        rightHandPosX,
        rightHandPosY,
        rightHandPosZ,
        leftHandPosX,
        leftHandPosY,
        leftHandPosZ,
        headPosX,
        headPosY,
        headPosZ,
        eyeTrackerPosX,
        eyeTrackerPosY,
        eyeTrackerPosZ,
        eyeTrackerDirX,
        eyeTrackerDirY,
        eyeTrackerDirZ,
        rightHandRotPitch,
        rightHandRotYaw,
        rightHandRotRoll,
        leftHandRotPitch,
        leftHandRotYaw,
        leftHandRotRoll,
        headRotPitch,
        headRotYaw,
        headRotRoll,
        rightHandObject,
        leftHandObject,
        time,
        ...rest
      } = data;

      const rightHandObjectPos =
        rightHandObject !== "None"
          ? toCoordsObject(rightHandPosX, rightHandPosY, rightHandPosZ)
          : null;
      const leftHandObjectPos =
        leftHandObject !== "None"
          ? toCoordsObject(leftHandPosX, leftHandPosY, leftHandPosZ)
          : null;
      const rightHandObjectRot =
        rightHandObject !== "None"
          ? toRotCoordsObject(
              rightHandRotPitch,
              rightHandRotYaw,
              rightHandRotRoll
            )
          : null;
      const leftHandObjectRot =
        leftHandObject !== "None"
          ? toRotCoordsObject(leftHandRotPitch, leftHandRotYaw, leftHandRotRoll)
          : null;

      return {
        ...rest,
        time,
        millisecond: timeToMS(time),

        // Hand Objects
        rightHandObject: rightHandObject === "None" ? null : rightHandObject,
        leftHandObject: leftHandObject === "None" ? null : leftHandObject,

        // Positions
        rightHandPos: toCoordsObject(
          rightHandPosX,
          rightHandPosY,
          rightHandPosZ
        ),
        rightHandObjectPos,
        leftHandPos: toCoordsObject(leftHandPosX, leftHandPosY, leftHandPosZ),
        leftHandObjectPos,
        headPos: toCoordsObject(headPosX, headPosY, headPosZ),

        // Rotations
        rightHandRot: toRotCoordsObject(
          rightHandRotPitch,
          rightHandRotYaw,
          rightHandRotRoll
        ),
        rightHandObjectRot,
        leftHandRot: toRotCoordsObject(
          leftHandRotPitch,
          leftHandRotYaw,
          leftHandRotRoll
        ),
        leftHandObjectRot,
        headRot: toRotCoordsObject(headRotPitch, headRotYaw, headRotRoll),
      };
    });

    const fileData = {
      id: parsedFile.id,
      fileName: parsedFile.fileName.split(".")[0],
      totalTime,
      objects: experimentObjects,
      experimentData,
    };

    res.json(fileData);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
};
