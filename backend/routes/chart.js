const express = require("express");
const router = express.Router();

// const fs = require("fs");
// const Papa = require("papaparse");

// function generateFinalCsvFile(csvDataLibraryRooms, csvDataUnitsNames) {
//   return new Promise((resolve) => {
//     for (let i = 0; i < csvDataLibraryRooms.length; i++) {
//       let objectId = csvDataLibraryRooms[i].GUID;
//       let objectName = "";

//       for (let j = 0; j < csvDataUnitsNames.length; j++) {
//         if (csvDataUnitsNames[j].id == objectId) {
//           objectName = csvDataUnitsNames[j].name.substring(0, 3);
//           csvDataLibraryRooms[i].Name = objectName; //set the name of the room

//           const timestamp = csvDataLibraryRooms[i].CreationDate; // timestamp from CSV file
//           const dateObj = new Date(`${timestamp} GMT-0000`);
//           const options = { timeZone: "America/Los_Angeles" }; // specify timezone as options
//           const localTime = dateObj.toLocaleString("en-US", options); // convert the timestamp to local time
//           csvDataLibraryRooms[i].CreationDate = localTime;

//           const timestamp2 = csvDataLibraryRooms[i].EditDate; // timestamp from CSV file
//           const dateObj2 = new Date(`${timestamp2} GMT-0000`);
//           const options2 = { timeZone: "America/Los_Angeles" }; // specify timezone as options
//           const localTime2 = dateObj2.toLocaleString("en-US", options2); // convert the timestamp to local time
//           csvDataLibraryRooms[i].EditDate = localTime2;
//           delete csvDataLibraryRooms[i].headCount;
//         }
//       }
//     }

//     resolve(csvDataLibraryRooms);
//   });
// }

// function parseCsvDataLibraryRooms(csvDataUnitsNames) {
//   const csvFilePath = "./libraryRooms_13.csv";

//   const file = fs.createReadStream(csvFilePath);
//   var csvDataLibraryRooms = [];

//   return new Promise((resolve) => {
//     Papa.parse(file, {
//       header: true,
//       step: function (result) {
//         csvDataLibraryRooms.push(result.data);
//       },
//       complete: function (results, file) {
//         generateFinalCsvFile(csvDataLibraryRooms, csvDataUnitsNames).then(
//           (result) => {
//             resolve(result);
//           }
//         );
//       },
//     });
//   });
// }

// function parseCsvDataUnits() {
//   const csvFilePath = "./Units_2.csv";
//   const file = fs.createReadStream(csvFilePath);

//   return new Promise((resolve) => {
//     var csvDataUnitsNames = [];

//     Papa.parse(file, {
//       header: true,
//       step: function (result) {
//         csvDataUnitsNames.push({
//           name: result.data.Name,
//           id: result.data.GlobalID,
//         });
//       },
//       complete: function (results, file) {
//         parseCsvDataLibraryRooms(csvDataUnitsNames).then((result) => {
//           resolve(result);
//         });
//       },
//     });
//   });
// }

// router.get("/data", async (req, res, next) => {
//   try {
//     parseCsvDataUnits().then((result) => {
//       //   console.log(result);
//       res.send(result);
//     });

//     // res.send("sending back data");
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = router;
