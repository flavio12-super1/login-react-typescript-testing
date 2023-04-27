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

        fileName = `${path}`;
        fs.writeFileSync(`downloads/${path}/${fileName}.csv`, csvData);
      } else if (fileType === "text/csv") {
        // Convert CSV file to JSON object
        data = await csv().fromString(file.buffer.toString());

        // Remove any empty rows from the data
        data = data.filter((row) =>
          Object.values(row).some((value) => value !== "")
        );

        // Write the file to the file system
        fileName = `${path}`;
        fs.writeFileSync(`downloads/${path}/${fileName}.csv`, file.buffer);
      }
      console.log(fileName);

      res.status(200).json({ data: data, fileNameOriginal, fileName });
    }
  } catch (err) {
    next(err);
  }
});

const Papa = require("papaparse");

function generateFinalCsvFile(csvDataLibraryRooms, csvDataUnitsNames) {
  return new Promise((resolve) => {
    for (let i = 0; i < csvDataLibraryRooms.length; i++) {
      let objectId = csvDataLibraryRooms[i].GUID;
      let objectName = "";

      for (let j = 0; j < csvDataUnitsNames.length; j++) {
        if (csvDataUnitsNames[j].id == objectId) {
          // objectName = csvDataUnitsNames[j].name.substring(0, 3);
          objectName = csvDataUnitsNames[j].name.split("\r")[0];
          csvDataLibraryRooms[i].Name = objectName; //set the name of the room

          const timestamp = csvDataLibraryRooms[i].CreationDate; // timestamp from CSV file
          const dateObj = new Date(`${timestamp} GMT-0000`);
          const options = { timeZone: "America/Los_Angeles" }; // specify timezone as options
          const localTime = dateObj.toLocaleString("en-US", options); // convert the timestamp to local time
          csvDataLibraryRooms[i].CreationDate = localTime;

          const timestamp2 = csvDataLibraryRooms[i].EditDate; // timestamp from CSV file
          const dateObj2 = new Date(`${timestamp2} GMT-0000`);
          const options2 = { timeZone: "America/Los_Angeles" }; // specify timezone as options
          const localTime2 = dateObj2.toLocaleString("en-US", options2); // convert the timestamp to local time
          csvDataLibraryRooms[i].EditDate = localTime2;
          csvDataLibraryRooms[i].Level = csvDataUnitsNames[j].level.substring(
            csvDataUnitsNames[j].level.length - 2
          );

          delete csvDataLibraryRooms[i].headCount;
        }
      }
    }

    resolve(csvDataLibraryRooms);
  });
}

function parseCsvDataLibraryRooms(csvDataUnitsNames) {
  const csvFilePath = path.join(__dirname, `../downloads/library/library.csv`);

  const file = fs.createReadStream(csvFilePath);
  var csvDataLibraryRooms = [];

  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      step: function (result) {
        csvDataLibraryRooms.push(result.data);
      },
      complete: function (results, file) {
        generateFinalCsvFile(csvDataLibraryRooms, csvDataUnitsNames).then(
          (result) => {
            resolve(result);
          }
        );
      },
    });
  });
}

async function joinData(data) {
  const csvFilePath = path.join(__dirname, `../downloads/units/units.csv`);
  const file = fs.createReadStream(csvFilePath);

  return new Promise((resolve) => {
    var csvDataUnitsNames = [];

    Papa.parse(file, {
      header: true,
      step: function (result) {
        csvDataUnitsNames.push({
          name: result.data["Name"],
          id: result.data["GlobalID"],
          level: result.data["Level ID"],
        });
      },
      complete: function (results, file) {
        parseCsvDataLibraryRooms(csvDataUnitsNames).then((result) => {
          resolve(result);
        });
      },
    });
  });
}

router.get("/file", async (req, res, next) => {
  console.log("request made to /file ......................... ");
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
      libraryData: null,
      joinData: null,
      fileNameOriginal: fileNameOriginal ?? null,
      fileNameZero: fileNameDownloadZero ?? null,
      fileName: fileNameDownload ?? null,
      fileType: fileType ?? null,
    };

    async function getData(fileData) {
      if (fileData) {
        if (fileType === "xlsx") {
          // Convert XLSX file to CSV string
          const workbook = xlsx.read(fileData);
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvData = xlsx.utils.sheet_to_csv(sheet);

          // Convert CSV data to JSON object
          let data = await csv().fromString(csvData);
          return data;
        } else {
          // Convert CSV file to JSON object
          let data = await csv().fromString(fileData.toString());
          return data;
        }
      }
    }

    // Check if the file exists Read the file from the file system
    const filePathZero = path.join(
      __dirname,
      `../downloads/${fileNameZero}/${fileNameZero}.csv`
    );
    if (fs.existsSync(filePathZero)) {
      fileDataZero = fs.readFileSync(
        `downloads/${fileNameZero}/${fileNameZero}.csv`
      );
      // Set the response headers
      fileTypeZero = fileNameZero.endsWith(".xlsx") ? "xlsx" : "csv";
      fileNameOriginalZero = fileNameZero.replace(/\.[^/.]+$/, "");
      fileNameDownloadZero = `${fileNameOriginalZero}`;
      data.fileNameZero = fileNameDownloadZero;
      data.libraryData = await getData(fileDataZero);
      //set data here
    } else {
      data.fileNameZero = "No File";
      console.log("File not found:", filePathZero);
    }

    const filePath = path.join(
      __dirname,
      `../downloads/${fileName}/${fileName}.csv`
    );
    if (fs.existsSync(filePath)) {
      fileData = fs.readFileSync(`downloads/${fileName}/${fileName}.csv`);

      // Set the response headers
      data.fileType = "csv";
      fileNameOriginal = fileName.replace(/\.[^/.]+$/, "");
      data.fileNameOriginal = fileNameOriginal;
      fileNameDownload = `${fileNameOriginal}`;
      data.fileName = fileNameDownload;
      data.data = await getData(fileData);
    } else {
      data.fileName = "No File";
      console.log("File not found:", filePath);
    }

    res.set({
      "Content-Type": "application/json",
    });

    console.log("waiting for data to send ......................... ");
    // console.log(data);
    console.log(
      "fileName: " +
        data.fileName +
        " : " +
        "fileNameZero: " +
        data.fileNameZero
    );
    if (data.fileNameZero != "No File" && data.fileName != "No File") {
      console.log("calling function ........................");
      await joinData().then((response) => {
        // console.log(response);
        data.joinData = response;
        console.log("sending data to frontend ......................... ");
        // console.log(data);
        res.json(data);
      });
    } else {
      console.log(
        "sending partial data to frontend ......................... "
      );
      res.json(data);
    }
    console.log("end of function ............................");

    // }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
