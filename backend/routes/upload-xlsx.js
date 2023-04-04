const express = require("express");
const router = express.Router();
const xlsx = require("xlsx");
const multer = require("multer");
const csv = require("csvtojson");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/file", upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    const fileType = file.mimetype;
    const fileSize = file.size / 1024 / 1024; // Convert bytes to MB

    if (
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "text/csv"
    ) {
      res
        .status(400)
        .send("Invalid file type. Please select an XLSX or CSV file.");
    } else if (fileSize > 10) {
      // Max file size of 10MB
      res.status(400).send("File is too large. Please select a smaller file.");
    } else {
      let data;

      if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        // Read XLSX file
        const workbook = xlsx.read(file.buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert sheet to CSV string
        const csvData = xlsx.utils.sheet_to_csv(sheet);

        // Convert CSV data to JSON object
        data = await csv().fromString(csvData);
      } else if (fileType === "text/csv") {
        // Convert CSV file to JSON object
        data = await csv().fromString(file.buffer.toString());

        // Remove any empty rows from the data
        data = data.filter((row) =>
          Object.values(row).some((value) => value !== "")
        );
      }

      res.status(200).send(data);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
