const express = require("express");
const router = express.Router();
const xlsx = require("xlsx");
const multer = require("multer");
const csv = require("csvtojson");
const fs = require("fs");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/file", upload.single("file"), async (req, res, next) => {
  try {
    const path = req.query.path;
    console.log(path);
    const file = req.file;
    const fileNameOriginal = file.originalname;
    let fileName = "";
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

        // const fileName = `${Date.now()}-${file.originalname}`;
        fileName = `${path}`;
        fs.writeFileSync(`downloads/${path}/${fileName}`, csvData);
      } else if (fileType === "text/csv") {
        // Convert CSV file to JSON object
        data = await csv().fromString(file.buffer.toString());

        // Remove any empty rows from the data
        data = data.filter((row) =>
          Object.values(row).some((value) => value !== "")
        );

        // Write the file to the file system
        // const fileName = `${Date.now()}-${file.originalname}`;
        fileName = `${path}`;
        fs.writeFileSync(`downloads/${path}/${fileName}`, file.buffer);
      }
      console.log(fileName);

      res.status(200).json({ data: data, fileNameOriginal, fileName });
    }
  } catch (err) {
    next(err);
  }
});

// router.get("/file", async (req, res, next) => {
//   try {
//     const fileName = req.query.fileName;
//     // const fileName = req.params.fileName;

//     // Check if the file exists
//     if (!fs.existsSync(`downloads/${fileName}/${fileName}`)) {
//       res.status(404).send("File not found.");
//     } else {
//       // Read the file from the file system
//       const fileData = fs.readFileSync(`downloads/${fileName}/${fileName}`);

//       // Set the response headers
//       res.set({
//         "Content-Type": "text/plain",
//         "Content-Disposition": `attachment; filename="${fileName}/${fileName}"`,
//       });

//       // Send the file data in the response
//       res.send({ fileData: fileData, fileName: fileName });
//     }
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/file", async (req, res, next) => {
//   try {
//     const fileNameZero = req.query.fileDataZero;
//     const fileName = req.query.fileName;

//     let fileTypeZero;
//     let fileNameOriginalZero;
//     let fileNameDownloadZero;

//     let fileType;
//     let fileNameOriginal;
//     let fileNameDownload;

//     const data = {
//       data: null,
//       fileNameOriginal: fileNameOriginal,
//       fileNameZero: fileNameDownloadZero,
//       fileName: fileNameDownload,
//       fileType: fileType,
//     };

//     // Check if the file exists
//     if (!fs.existsSync(`downloads/${fileName}/${fileName}`)) {
//       // res.status(404).send("File not found.");
//       console.log("file not found");
//     } else {
//       // Read the file from the file system
//       const fileDataZero = fs.readFileSync(
//         `downloads/${fileNameZero}/${fileNameZero}`
//       );
//       const fileData = fs.readFileSync(`downloads/${fileName}/${fileName}`);

//       // Set the response headers

//       // const fileTypeZero = fileNameZero.endsWith(".xlsx") ? "xlsx" : "csv";
//       // const fileNameOriginalZero = fileNameZero.replace(/\.[^/.]+$/, "");
//       // const fileNameDownloadZero = `${fileNameOriginalZero}`;

//       // const fileType = fileName.endsWith(".xlsx") ? "xlsx" : "csv";
//       // const fileNameOriginal = fileName.replace(/\.[^/.]+$/, "");
//       // const fileNameDownload = `${fileNameOriginal}`;
//       fileTypeZero = fileNameZero.endsWith(".xlsx") ? "xlsx" : "csv";
//       fileNameOriginalZero = fileNameZero.replace(/\.[^/.]+$/, "");
//       fileNameDownloadZero = `${fileNameOriginalZero}`;
//       data.fileNameZero = fileNameDownloadZero;

//       data.fileType = fileName.endsWith(".xlsx") ? "xlsx" : "csv";
//       fileNameOriginal = fileName.replace(/\.[^/.]+$/, "");
//       data.fileNameOriginal = fileNameOriginal;
//       fileNameDownload = `${fileNameOriginal}`;
//       data.fileName = fileNameDownload;

//       res.set({
//         "Content-Type": "application/json",
//       });

//       // Send the file data in the response
//       // const data = {
//       //   data: null,
//       //   fileNameOriginal: fileNameOriginal,
//       //   fileNameZero: fileNameDownloadZero,
//       //   fileName: fileNameDownload,
//       //   fileType: fileType,
//       // };

//       if (fileType === "xlsx") {
//         // Convert XLSX file to CSV string
//         const workbook = xlsx.read(fileData);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const csvData = xlsx.utils.sheet_to_csv(sheet);

//         // Convert CSV data to JSON object
//         data.data = await csv().fromString(csvData);
//       } else {
//         // Convert CSV file to JSON object
//         data.data = await csv().fromString(fileData.toString());
//       }
//       console.log(data);
//       res.json(data);
//     }
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = router;

router.get("/file", async (req, res, next) => {
  try {
    const fileNameZero = req.query.fileDataZero;
    const fileName = req.query.fileName;

    let fileData;

    let fileDataZero;
    let fileTypeZero;
    let fileNameOriginalZero;
    let fileNameDownloadZero;

    let fileType;
    let fileNameOriginal;
    let fileNameDownload;

    const data = {
      data: null,
      fileNameOriginal: fileNameOriginal ?? null,
      fileNameZero: fileNameDownloadZero ?? null,
      fileName: fileNameDownload ?? null,
      fileType: fileType ?? null,
    };

    // Check if the file exists
    // if (!fs.existsSync(`downloads/${fileName}/${fileName}`)) {
    //   res.status(404).send("File not found.");
    //   // console.log("file not found");
    // } else {
    // Read the file from the file system
    const filePathZero = path.join(
      __dirname,
      `../downloads/${fileNameZero}/${fileNameZero}`
    );
    if (fs.existsSync(filePathZero)) {
      fileDataZero = fs.readFileSync(
        `downloads/${fileNameZero}/${fileNameZero}`
      );
      // Set the response headers
      fileTypeZero = fileNameZero.endsWith(".xlsx") ? "xlsx" : "csv";
      fileNameOriginalZero = fileNameZero.replace(/\.[^/.]+$/, "");
      fileNameDownloadZero = `${fileNameOriginalZero}`;
      data.fileNameZero = fileNameDownloadZero;
    } else {
      data.fileNameZero = "No File";
      console.log("File not found:", filePathZero);
    }

    const filePath = path.join(
      __dirname,
      `../downloads/${fileName}/${fileName}`
    );
    if (fs.existsSync(filePath)) {
      fileData = fs.readFileSync(`downloads/${fileName}/${fileName}`);

      // Set the response headers

      // data.fileType = fileName.endsWith(".xlsx") ? "xlsx" : "csv";
      data.fileType = "csv";
      fileNameOriginal = fileName.replace(/\.[^/.]+$/, "");
      data.fileNameOriginal = fileNameOriginal;
      fileNameDownload = `${fileNameOriginal}`;
      data.fileName = fileNameDownload;
    } else {
      data.fileName = "No File";
      console.log("File not found:", filePath);
    }

    res.set({
      "Content-Type": "application/json",
    });

    if (fileData) {
      if (fileType === "xlsx") {
        // Convert XLSX file to CSV string
        const workbook = xlsx.read(fileData);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const csvData = xlsx.utils.sheet_to_csv(sheet);

        // Convert CSV data to JSON object
        data.data = await csv().fromString(csvData);
      } else {
        // Convert CSV file to JSON object
        data.data = await csv().fromString(fileData.toString());
      }
    }

    console.log(data);
    res.json(data);
    // }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
