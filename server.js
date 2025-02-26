const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('csvFile'), (request, response) => {
    if (!request.file) return response.status(400).send('No file uploaded.');

    const results = [];
    fs.createReadStream(request.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            fs.unlinkSync(request.file.path);
            response.json(results);
        })
})