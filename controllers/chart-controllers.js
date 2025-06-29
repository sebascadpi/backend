const {
  OBJECT_CHART_COLORS,
  DEFAULT_CHART_COLOR,
} = require("../constants/object-colors");
const { CsvFile, SessionData } = require("../models");
const {
  getTotalObjectTime,
  joinObjectTimes,
  toHistogramSerie,
  mapHandObjectTimeline,
  joinObjectTimelines,
} = require("../utils/chart.utils");
const { timeToSeconds } = require("../utils/time.utils");

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

    const dataWithSeconds = parsedFile.SessionData.map(
      ({ time, rightHandObject, leftHandObject }) => ({
        rightHandObject: rightHandObject === "None" ? null : rightHandObject,
        leftHandObject: leftHandObject === "None" ? null : leftHandObject,
        second: timeToSeconds(time),
      })
    );

    const rightHandObjectTimes = getTotalObjectTime(
      dataWithSeconds,
      "rightHandObject"
    );
    const leftHandObjectTimes = getTotalObjectTime(
      dataWithSeconds,
      "leftHandObject"
    );
    const joinedTimes = joinObjectTimes(
      leftHandObjectTimes,
      rightHandObjectTimes
    );
    const data = toHistogramSerie(joinedTimes);
    const colors = Object.keys(joinedTimes).map(
      (item) => `${OBJECT_CHART_COLORS[item] || DEFAULT_CHART_COLOR}`
    );

    const fileData = {
      data: [
        {
          name: "Tiempo total",
          type: "bar",
          data,
        },
      ],
      colors,
    };

    res.json(fileData);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
};

exports.getHandObjectTimeline = async (req, res) => {
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

    const dataWithSeconds = parsedFile.SessionData.map(
      ({ time, rightHandObject, leftHandObject }) => ({
        rightHandObject: rightHandObject === "None" ? null : rightHandObject,
        leftHandObject: leftHandObject === "None" ? null : leftHandObject,
        second: timeToSeconds(time),
      })
    );

    const rightHandObjectTimeline = mapHandObjectTimeline(
      dataWithSeconds,
      "rightHandObject"
    );
    const leftHandObjectTimeline = mapHandObjectTimeline(
      dataWithSeconds,
      "leftHandObject"
    );

    const data = joinObjectTimelines(
      leftHandObjectTimeline,
      rightHandObjectTimeline
    );

    const series = Object.entries(data).map(([name, data]) => ({
      name,
      data,
    }));
    const colors = series.map(
      ({ name }) => `${OBJECT_CHART_COLORS[name] || DEFAULT_CHART_COLOR}`
    );

    const fileData = {
      data: series,
      colors,
    };

    res.json(fileData);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send("Error fetching file");
  }
};
