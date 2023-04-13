import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import "../styles/App.css";
import ChartApp from "./chartApp";
import axios from "axios";
import * as xlsx from "xlsx";
import csv from "csvtojson";
import { parse } from "papaparse";
const classNames = require("classnames");
classNames("foo", "bar"); // => 'foo bar'

function Dashboard() {
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState("testing");
  const [option, setOption] = useState("");
  const [unitsFileName, setUnitsFileName] = useState("No File");
  const [libraryFileName, setLibraryFileName] = useState("No File");

  const setGraph = (data) => {
    console.log("rendering");
    if (data.fileName == "units") {
      console.log("units data added");
    } else if (data.fileName == "library") {
      console.log(data.data);
      setData(data.data);
      console.log("library file added");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;
      axios
        .get("/verify")
        .then((response) => {
          if (response.data.message === "success") {
            setAuthorized(true);
          } else {
            <Navigate to="/login" />;
          }
        })
        .catch((error) => {
          console.log(error);
        });
      //get login info
      axios.get("/loginStatus").then((response) => {
        if (response.data.loggedIn) {
          setUsername(response.data.user.email);
        }
      });
    } else {
      window.location.href = "/login";
    }
    // axios
    //   .get("/upload/file", {
    //     params: {
    //       fileName: "library", // replace with the actual file name
    //     },
    //   })
    //   .then((response) => {
    //     console.log(response.data.fileData + " : " + response.data.fileName); // this will log the file data to the console
    //     setLibraryFileName(response.data.fileName);
    //     setGraph(response.data.fileData);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
    axios
      .get("/upload/file", {
        params: { fileDataZero: "units", fileName: "library" },
        // responseType: "blob",
      })
      .then((response) => {
        const fileNameZero = response.data.fileNameZero;
        const fileName = response.data.fileName;

        const fileData = response.data;
        console.log(fileNameZero);
        setUnitsFileName(fileNameZero);
        setLibraryFileName(fileName);
        setGraph(fileData);

        console.log(fileData);
        // if (fileType === "xlsx") {
        //   // Process XLSX data
        //   const workbook = xlsx.read(response.data, { type: "array" });

        //   const sheet = workbook.Sheets[workbook.SheetNames[0]];
        //   const csvData = xlsx.utils.sheet_to_csv(sheet);
        //   const jsonData = csv().fromString(response.data.toString());

        //   console.log(jsonData);
        // } else {
        //   // Process CSV data
        //   const jsonData = csv().fromString(response.data.fileData.toString());

        //   console.log(jsonData);
        // }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleLogout = async (event) => {
    event.preventDefault();

    try {
      axios
        .get("http://localhost:8000/logout")
        .then((res) => {
          localStorage.removeItem("token");
          window.location.replace(res.request.responseURL);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   if (authorized) {
  //     axios
  //       .get("/chart/data")
  //       .then((response) => {
  //         console.log(response.data);
  //         // setData(response.data);
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //       });
  //   }
  // }, [authorized]);

  //upload xlsx or csv file
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    const fileType = file.type;
    const fileSize = file.size / 1024 / 1024; // Convert bytes to MB

    if (
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "text/csv"
    ) {
      setErrorMessage("Invalid file type. Please select an XLSX or CSV file.");
    } else if (fileSize > 10) {
      // Max file size of 10MB
      setErrorMessage("File is too large. Please select a smaller file.");
    } else {
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  // const setGraph = (data) => {
  //   if (data.fileName == "units") {
  //     console.log("units data added");
  //   } else if (data.fileName == "library") {
  //     console.log(data.data);
  //     setData(data.data);
  //     console.log("library file added");
  //   }
  // };

  const handleUpload = () => {
    if (option != "") {
      const formData = new FormData();
      formData.append("file", selectedFile);
      console.log(option);
      axios
        .post("/upload/file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            path: option,
          },
        })
        .then((res) => {
          console.log(res.data.data);
          const fileExtension = selectedFile.name.split(".").pop();
          if (fileExtension === "xlsx") {
            // setData(res.data.data);
            setGraph(res.data);
            if (option == "units") {
              setUnitsFileName(res.data.fileName);
            } else if (option == "library") {
              setLibraryFileName(res.data.fileName);
            }
          } else if (fileExtension === "csv") {
            const reader = new FileReader();
            reader.onload = () => {
              // setData(res.data.data);
              setGraph(res.data);
              if (option == "units") {
                setUnitsFileName(res.data.fileName);
              } else if (option == "library") {
                setLibraryFileName(res.data.fileName);
              }
            };
            reader.readAsText(selectedFile);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert("please select an option");
    }
  };

  const deleteFile = (fileName) => {
    axios
      .post("/delete/file", {
        data: {
          fileName: fileName,
        },
      })
      .then((response) => {
        console.log(response.data.message);
        if (response.data.message == "success") {
          alert("file successfuly deleted");
          if (response.data.fileName == "units") {
            setUnitsFileName("No File");
          } else if (response.data.fileName == "library") {
            setLibraryFileName("No File");
          }
        } else {
          alert("error deleting file!");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDelete = (fileName) => {
    // if (option !== "") {
    if (fileName === unitsFileName && unitsFileName != "") {
      console.log(fileName);
      deleteFile(fileName);
    } else if (fileName === libraryFileName && libraryFileName != "") {
      console.log(fileName);
      deleteFile(fileName);
    } else {
      alert("there is nothing to delete");
    }
    // } else {
    //   alert("there is nothing to delete");
    // }
  };

  //check user auth
  const checkAuth = () => {
    axios
      .get("http://localhost:8000/isUserAuth")
      .then((response) => {
        alert(response.data.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (!authorized) {
    console.log("unauthorized");
    return <></>;
  }

  const getClassname = (id) => {
    if (id == option) {
      return "fileOption-selected";
    } else {
      return "fileOption";
    }
  };

  return (
    <div className="App">
      <div>username: {username}</div>
      <div>
        <button onClick={checkAuth}>check auth</button>
      </div>
      {/* upload xlsx*/}
      <div>
        <h1>Upload XLSX or CSV File</h1>
        <div>
          <button
            className={`btn ${getClassname("units")}`}
            id="units"
            onClick={(e) => setOption(e.target.id)}
          >
            units
          </button>
          <button
            className={`btn ${getClassname("library")}`}
            id="library"
            onClick={(e) => setOption(e.target.id)}
          >
            library
          </button>
        </div>
        <input type="file" onChange={handleFileInput} />
        {errorMessage && <p>{errorMessage}</p>}
        <button onClick={handleUpload} disabled={!selectedFile}>
          Upload
        </button>
        <div
          style={{
            border: "solid",
            width: "-webkit-fill-available",
          }}
        >
          <div
            style={{ display: "flex", borderBottom: "solid black" }}
            className={option === "units" ? "fileOptionDiv" : {}}
          >
            <div className="tableBorder hasRightBorder">units</div>
            <div className="tableNonBorder hasRightBorder">{unitsFileName}</div>
            <div className="tableBorder">
              <button onClick={() => handleDelete("units")}>delete</button>
            </div>
          </div>
          <div
            style={{ display: "flex" }}
            className={option === "library" ? "fileOptionDiv" : {}}
          >
            <div className="tableBorder hasRightBorder">library</div>
            <div className="tableNonBorder hasRightBorder">
              {libraryFileName}
            </div>
            <div className="tableBorder">
              <button onClick={() => handleDelete("library")}>delete</button>
            </div>
          </div>
        </div>
      </div>
      {/* render chart data*/}
      <div>
        {data != "" ? (
          <ChartApp data={data} />
        ) : (
          <div
            style={{
              height: "150px",
              width: "350px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No Data
          </div>
        )}
      </div>
      <button onClick={handleLogout}>log out</button>
    </div>
  );
}

export default Dashboard;
