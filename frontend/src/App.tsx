import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.css";

import SocketContext from "./config/SocketContext";
import io from "socket.io-client";
import axios from "./config/axiosConfig";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";

const socket = io();

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  //initialize socket.io
  useEffect(() => {
    if (token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    socket.on("connect", () => {
      console.log("socket is connected");
    });
    socket.on("disconnect", (reason) => {
      console.log("socket is disconnected: " + reason);
    });
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div className="App">
      <SocketContext.Provider value={{ socket }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
