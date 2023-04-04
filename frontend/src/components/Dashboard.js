import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import "../styles/App.css";
import ChartApp from "./chartApp";
import axios from "axios";
import { parse } from "papaparse";

function Dashboard() {
  const [authorized, setAuthorized] = useState(true);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState("testing");
  // const [token, setToken] = useState(`${localStorage.getItem("token")}`);

  useEffect(() => {
    // const token = localStorage.getItem("token");
    // setToken(localStorage.getItem("token"));

    //get login info
    axios.get("http://localhost:8000/loginStatus").then((response) => {
      if (response.data.loggedIn) setUsername(response.data.user.email);
      // console.log(response);
    });

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
    } else {
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = async (event) => {
    event.preventDefault();

    try {
      axios
        .post("http://localhost:8000/logout")
        .then((response) => {
          localStorage.removeItem("token");
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (authorized) {
      axios
        .get("/chart/data")
        .then((response) => {
          console.log(response.data);
          // setData(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [authorized]);

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
    const formData = new FormData();
    formData.append("file", selectedFile);

    axios
      .post("/upload/file", formData)
      .then((res) => {
        console.log(res.data);
        const fileExtension = selectedFile.name.split(".").pop();
        if (fileExtension === "xlsx") {
          setData(res.data);
        } else if (fileExtension === "csv") {
          const reader = new FileReader();
          reader.onload = () => {
            setData(res.data);
          };
          reader.readAsText(selectedFile);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  //check user auth
  const checkAuth = () => {
    axios
      .get("http://localhost:8000/isUserAuth", {
        headers: { "x-access-token": localStorage.getItem("token") },
      })
      .then((response) => {
        console.log(response);
      });
  };

  //send test request

  function sendRequest() {
    axios.post(`/test`, { data: "example data" }).then((res) => {
      if (res.data.error) alert("there was an error handling your request");
      alert(res.data.message);
    });
  }

  const outerDiv = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  if (!authorized) {
    console.log("unauthorized");
    return <></>;
  }

  return (
    <div className="App">
      <div style={outerDiv}>
        <span>This is a template</span>
        <button onClick={sendRequest} className="btn">
          test
        </button>
      </div>
      <div>username: {username}</div>
      <div>
        <button onClick={checkAuth}>check auth</button>
      </div>
      {/* upload xlsx*/}
      <div>
        <h1>Upload XLSX or CSV File</h1>
        <input type="file" onChange={handleFileInput} />
        {errorMessage && <p>{errorMessage}</p>}
        <button onClick={handleUpload} disabled={!selectedFile}>
          Upload
        </button>
      </div>
      {/* render chart data*/}
      <div>
        <ChartApp data={data} />
      </div>
      <button onClick={handleLogout}>log out</button>
    </div>
  );
}

export default Dashboard;
