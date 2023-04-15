import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import "../styles/App.css";
import ChartApp from "./chartApp";
import axios from "axios";
import Layout1 from "../images/Layout1.jpg";
import Layout2 from "../images/Layout2.jpg";
import Layout3 from "../images/Layout3.jpg";
import Layout4 from "../images/Layout4.jpg";

import FloorPicker from "./FloorPicker";
import FloorContext from "./FloorContext";

const classNames = require("classnames");
classNames("foo", "bar"); // => 'foo bar'

function Dashboard() {
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState("testing");
  const [option, setOption] = useState("");
  const [unitsFileName, setUnitsFileName] = useState("No File");
  const [libraryFileName, setLibraryFileName] = useState("No File");
  const [popUp, setPopUp] = useState("");

  const [selectedFloor, setSelectedFloor] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const floorState = {
    selectedFloor,
    setSelectedFloor,
    isExpanded,
    setIsExpanded,
  };

  const setGraph = (data) => {
    console.log("rendering");
    if (data.fileName === "units") {
      console.log("units data added");
    } else if (data.fileName === "library") {
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
    axios
      .get("/upload/file", {
        params: { fileDataZero: "units", fileName: "library" },
      })
      .then((response) => {
        const fileNameZero = response.data.fileNameZero;
        const fileName = response.data.fileName;

        const fileData = response.data;
        setUnitsFileName(fileNameZero);
        setLibraryFileName(fileName);
        console.log("data state has been updated");

        setGraph(fileData);

        console.log(fileData);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    console.log("------ setData state has been updated ------");
  }, [data]);

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

  const handleUpload = () => {
    if (option) {
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
            setGraph(res.data);
            if (option === "units") {
              setUnitsFileName(res.data.fileName);
            } else if (option === "library") {
              setLibraryFileName(res.data.fileName);
            }
          } else if (fileExtension === "csv") {
            const reader = new FileReader();
            reader.onload = () => {
              setGraph(res.data);
              if (option === "units") {
                setUnitsFileName(res.data.fileName);
              } else if (option === "library") {
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
        if (response.data.message === "success") {
          alert("file successfuly deleted");
          if (response.data.fileName === "units") {
            setUnitsFileName("No File");
          } else if (response.data.fileName === "library") {
            setLibraryFileName("No File");
          }
          setData([]);
        } else {
          alert("error deleting file!");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDelete = (fileName) => {
    if (fileName === unitsFileName && unitsFileName !== "") {
      console.log(fileName);
      deleteFile(fileName);
    } else if (fileName === libraryFileName && libraryFileName !== "") {
      console.log(fileName);
      deleteFile(fileName);
    } else {
      alert("there is nothing to delete");
    }
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
    if (id === option) {
      return "fileOption-selected";
    } else {
      return "fileOption";
    }
  };

  const callSetPopUp = (id) => {
    setPopUp(id);
    console.log("hello");
  };

  const elements1 = [
    { id: 1, style: { top: 100, left: 50 } },
    { id: 2, style: { top: 390, left: 630 } },
  ];

  const elements2 = [
    { id: 1, style: { top: 380, left: 50 } },
    { id: 2, style: { top: 405, left: 100 } },
    { id: 3, style: { top: 405, left: 140 } },
    { id: 4, style: { top: 405, left: 170 } },
    { id: 5, style: { top: 405, left: 210 } },
    { id: 6, style: { top: 405, left: 240 } },
    { id: 7, style: { top: 405, left: 280 } },
    { id: 8, style: { top: 405, left: 310 } },
    { id: 9, style: { top: 405, left: 400 } },
  ];

  const elements3 = [
    { id: 1, style: { top: 360, left: 50 } },
    { id: 2, style: { top: 385, left: 140 } },
    { id: 3, style: { top: 385, left: 205 } },
    { id: 4, style: { top: 385, left: 240 } },
    { id: 5, style: { top: 385, left: 275 } },
    { id: 6, style: { top: 385, left: 310 } },
    { id: 7, style: { top: 385, left: 385 } },
  ];

  const elements4 = [
    { id: 1, style: { top: 380, left: 65 } },
    { id: 2, style: { top: 405, left: 130 } },
    { id: 3, style: { top: 405, left: 205 } },
    { id: 4, style: { top: 405, left: 275 } },
    { id: 5, style: { top: 405, left: 350 } },
    { id: 6, style: { top: 230, left: 350 } },
    { id: 7, style: { top: 125, left: 350 } },
    { id: 8, style: { top: 125, left: 570 } },
  ];

  const elementsList = [elements1, elements2, elements3, elements4];

  function MyComponent() {
    return (
      <div>
        {elementsList[selectedFloor - 1].map(({ id, style }) => (
          <button
            className="mapElelement"
            key={id}
            style={style}
            onClick={() => callSetPopUp(id)}
          >
            <div className="mapElelementBtn">{id}</div>
          </button>
        ))}
      </div>
    );
  }

  function renderChart() {
    return <ChartApp data={data} />;
  }

  const layoutList = [Layout1, Layout2, Layout3, Layout4];

  const getImage = () => {
    return (
      <div>
        {MyComponent()}
        <img
          src={layoutList[selectedFloor - 1]}
          alt=""
          style={{ height: "550px", zIndex: "0" }}
        />
      </div>
    );
  };

  function checkIfDisabled() {
    if (unitsFileName !== "No File" && selectedFile) {
      return false;
    } else if (option == "units" && libraryFileName == "No File") {
      return false;
    } else {
      return true;
    }
  }

  return (
    <FloorContext.Provider value={floorState}>
      <div className="App">
        <div className="leftSide">
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
            <button onClick={handleUpload} disabled={checkIfDisabled()}>
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
                <div className="tableNonBorder hasRightBorder">
                  {unitsFileName}
                </div>
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
                  <button onClick={() => handleDelete("library")}>
                    delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button onClick={handleLogout}>log out</button>
        </div>
        {/* render chart data*/}
        <div className="rightSide">
          {data !== "" &&
          (unitsFileName == "No File" || libraryFileName == "No File") ? (
            // <Image/>
            <div
              style={{
                height: "150px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "100px",
                paddingTop: "10px",
              }}
            >
              Upload both a units and library csv or xlsx file to be able to
              rder the data
            </div>
          ) : (
            <div>
              <div className="graphPicker">
                <div>
                  <div className="mapElelement">
                    <FloorPicker />
                  </div>
                  {getImage()}
                </div>

                <div className="popup">
                  {popUp !== "" ? popUp : <div>no popup has been selected</div>}
                </div>
              </div>
              <div style={{ width: "700px" }}>{renderChart()}</div>
            </div>
          )}
        </div>
      </div>
    </FloorContext.Provider>
  );
}

export default Dashboard;
