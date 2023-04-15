const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.post("/file", async (req, res, next) => {
  const fileName = req.body.data.fileName;
  console.log(fileName);

  const filePath = path.join(
    __dirname,
    `../downloads/${fileName}/${fileName}.csv`
  );

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File removed:", filePath);
      res.send({ message: "success", fileName: fileName });
    } else {
      console.log("File not found:", filePath);
    }
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
