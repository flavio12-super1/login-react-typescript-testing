import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import "../styles/App.css";
import axios from "axios";

function Dashboard() {
  const [authorized, setAuthorized] = useState(false);

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

      <button onClick={handleLogout}>log out</button>
    </div>
  );
}

export default Dashboard;
