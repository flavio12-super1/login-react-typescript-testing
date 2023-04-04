// import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import "../styles/App.css";
// import ChartApp from "./chartApp";
// import axios from "axios";

// function Dashboard() {
//   const [authorized, setAuthorized] = useState(false);
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       axios
//         .get("/verify")
//         .then((response) => {
//           if (response.data.message === "success") {
//             setAuthorized(true);
//           } else {
//             <Navigate to="/login" />;
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } else {
//       window.location.href = "/login";
//     }
//   }, []);

//   // useEffect(() => {
//   //   if (authorized) {
//   //     axios
//   //       .get("/chart/data")
//   //       .then((response) => {
//   //         console.log(response.data);
//   //         setData(response.data);
//   //       })
//   //       .catch((error) => {
//   //         console.error(error);
//   //       });
//   //   }
//   // }, [authorized]);

//   const handleLogout = async (event) => {
//     event.preventDefault();

//     try {
//       axios
//         .post("/logout")
//         .then((response) => {
//           localStorage.removeItem("token");
//           window.location.href = "/login";
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   //upload xlsx file
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleFileInput = (event) => {
//     const file = event.target.files[0];
//     const fileType = file.type;
//     const fileSize = file.size / 1024 / 1024; // Convert bytes to MB

//     if (
//       fileType !==
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ) {
//       setErrorMessage("Invalid file type. Please select an XLSX file.");
//     } else if (fileSize > 10) {
//       // Max file size of 10MB
//       setErrorMessage("File is too large. Please select a smaller file.");
//     } else {
//       setSelectedFile(file);
//       setErrorMessage("");
//     }
//   };

//   const handleUpload = () => {
//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     axios
//       .post("/upload/xlsx", formData)
//       .then((res) => {
//         console.log(res.data);
//         setData(res.data);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   };

//   //send test request

//   function sendRequest() {
//     axios.post(`/test`, { data: "example data" }).then((res) => {
//       if (res.data.error) alert("there was an error handling your request");
//       alert(res.data.message);
//     });
//   }

//   const outerDiv = {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//   };

//   if (!authorized) {
//     console.log("unauthorized");
//     return <></>;
//   }

//   return (
//     <div className="App">
//       <div style={outerDiv}>
//         <span>This is a template</span>
//         <button onClick={sendRequest} className="btn">
//           test
//         </button>
//       </div>
//       {/* upload xlsx*/}
//       <div>
//         <h1>Upload XLSX</h1>
//         <input type="file" onChange={handleFileInput} />
//         {errorMessage && <p>{errorMessage}</p>}
//         <button onClick={handleUpload} disabled={!selectedFile}>
//           Upload
//         </button>
//       </div>
//       {/* render chart data*/}
//       <div>
//         <ChartApp data={data} />
//       </div>
//       <button onClick={handleLogout}>log out</button>
//     </div>
//   );
// }

// export default Dashboard;

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import "../styles/App.css";
import ChartApp from "./chartApp";
import axios from "axios";
import { parse } from "papaparse";

function Dashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
        .post("/logout")
        .then((response) => {
          localStorage.removeItem("token");
          window.location.href = "/login";
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
