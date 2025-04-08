const express = require("express");
const router = express.Router();
const multer = require("multer");
const csvController = require("../controllers/csv-controllers.js");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("csvFile"), csvController.uploadCsv);
router.get("/files", csvController.getFiles);
router.get("/files/:id", csvController.getFileById);

module.exports = router;
