const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("csvFile"), (request, response) => {
  if (!request.file) {
    console.error("No file uploaded.");
    return response.status(400).send("No file uploaded.");
  }

  console.log("File uploaded successfully:", request.file);

  const results = [];
  fs.createReadStream(request.file.path)
    .pipe(csvParser())
    .on("data", (data) => {
      console.log("Parsed data:", data);
      results.push(data);
    })
    .on("error", (error) => {
      console.error("Error while parsing CSV:", error);
      response.status(500).send("Error while parsing CSV.");
    })
    .on("end", () => {
      console.log("Finished parsing CSV. Results:", results);
      fs.unlinkSync(request.file.path);

      if (!results.length) return response.status(400).send("No data found.");
      const headers = Object.keys(results[0])[0].split(";");
      const rows = results.map((result) => Object.values(result)[0].split(";"));
      const mappedRows = rows.map((row) => {
        if (!row?.length) return row;
        return (objectRow = row.reduce(
          (acc, value, index) => ({
            ...acc,
            [headers[index]]: value,
          }),
          {}
        ));
      });

      response.json({ headers, rows: mappedRows, length: results.length });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
