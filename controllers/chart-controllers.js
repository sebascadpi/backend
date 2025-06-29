const {
  OBJECT_CHART_COLORS,
  DEFAULT_CHART_COLOR,
} = require("../constants/object-colors");
const { CsvFile, SessionData } = require("../models");
const {
  getTotalObjectTime,
  joinObjectTimes,
  toChartSerie,
} = require("../utils/chart.utils");
const { timeToMS } = require("../utils/time.utils");

exports.getTotalTimePerObject = async (req, res) => {
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

    const dataWithMilliseconds = parsedFile.SessionData.map(
      ({ time, rightHandObject, leftHandObject }) => ({
        rightHandObject: rightHandObject === "None" ? null : rightHandObject,
        leftHandObject: leftHandObject === "None" ? null : leftHandObject,
        millisecond: timeToMS(time),
      })
    );

    const rightHandObjectTimes = getTotalObjectTime(
      dataWithMilliseconds,
      "rightHandObject"
    );
    const leftHandObjectTimes = getTotalObjectTime(
      dataWithMilliseconds,
      "leftHandObject"
    );
    const joinedTimes = joinObjectTimes(
      leftHandObjectTimes,
      rightHandObjectTimes
    );
    const data = toChartSerie(joinedTimes);
    const colors = Object.keys(joinedTimes).map(
      (item) => `${OBJECT_CHART_COLORS[item] || DEFAULT_CHART_COLOR}`
    );

    const fileData = {
      data: {
        name: "Tiempo total",
        type: "bar",
        data,
      },
      colors,
    };

    res.json(fileData);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
};
