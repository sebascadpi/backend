const { CsvFile } = require("../models");
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
    const files = await CsvFile.findAll();
    res.json(files);
  } catch (error) {
    res.status(500).send("Error fetching files");
  }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await CsvFile.findByPk(req.params.id);
    if (!file) {
      return res.status(404).send("File not found");
    }
    res.json(file);
  } catch (error) {
    res.status(500).send("Error fetching file");
  }
};
