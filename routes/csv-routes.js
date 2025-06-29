const express = require("express");
const router = express.Router();
const multer = require("multer");
const experimentController = require("../controllers/experiment-controllers.js");
const chartController = require("../controllers/chart-controllers.js");

const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.single("csvFile"),
  experimentController.uploadExperimentCsv
);
router.get("/", experimentController.getExperiments);
router.get("/:id", experimentController.getExperimentById);
router.get("/:id/view", experimentController.getExperimentViewById);
router.get("/:id/total-time-per-object", chartController.getTotalTimePerObject);
router.get("/:id/hand-object-timeline", chartController.getHandObjectTimeline);

module.exports = router;
