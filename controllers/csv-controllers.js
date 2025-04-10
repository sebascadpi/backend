const { CsvFile, SessionData, Position, Rotation } = require("../models");
const { saveRow } = require("../services/csv-service");
const fs = require("fs");
const csvParser = require("csv-parser");

exports.uploadCsv = async (req, res) => {
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

exports.getFiles = async (req, res) => {
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

      // Calculate total time from the last SessionData entry
      const lastSession = fileData.SessionData[fileData.SessionData.length - 1];
      const totalTime = lastSession ? lastSession.time : "0:0:0";

      // objectPut and totalErrors
      const totalErrors =
        fileData.SessionData[fileData.SessionData.length - 1].totalErrors || 0;
      const totalObjectsPut =
        fileData.SessionData[fileData.SessionData.length - 1].objectPut || 0;

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

exports.getFileById = async (req, res) => {
  try {
    const file = await CsvFile.findByPk(req.params.id, {
      include: [
        {
          model: SessionData,
          // attributes: [
          //   "time",
          //   "objectPut",
          //   "totalErrors",
          //   "rightHandObject",
          //   "leftHandObject",
          // ],
          order: [["rowIndex", "ASC"]],
        },
      ],
    });
    if (!file) return res.status(404).send("File not found");
    // console.log("File found:", file.toJSON());

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
        ...rest
      } = data;

      return {
        ...rest,
        // Positions
        rightHandPos: `X=${rightHandPosX}, Y=${rightHandPosY}, Z=${rightHandPosZ}`,
        leftHandPos: `X=${leftHandPosX}, Y=${leftHandPosY}, Z=${leftHandPosZ}`,
        headPos: `X=${headPosX}, Y=${headPosY}, Z=${headPosZ}`,
        eyeTrackerPos: `X=${eyeTrackerPosX}, Y=${eyeTrackerPosY}, Z=${eyeTrackerPosZ}`,
        eyeTrackerDir: `X=${eyeTrackerDirX}, Y=${eyeTrackerDirY}, Z=${eyeTrackerDirZ}`,

        // Rotations
        rightHandRot: `P=${rightHandRotPitch}, Y=${rightHandRotYaw}, R=${rightHandRotRoll}`,
        leftHandRot: `P=${leftHandRotPitch}, Y=${leftHandRotYaw}, R=${leftHandRotRoll}`,
        headRot: `P=${headRotPitch}, Y=${headRotYaw}, R=${headRotRoll}`,
      };
    });

    const fileData = {
      id: parsedFile.id,
      fileName: parsedFile.fileName,
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
