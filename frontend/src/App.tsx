import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/App.css";

import SocketContext from "./config/SocketContext";
import io from "socket.io-client";
import axios from "./config/axiosConfig";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Lurker from "./components/Lurker";
import Chat from "./components/Chat";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import Explore from "./components/navComponents/Explore";

const socket = io({
  auth: {
    token: localStorage.getItem("token"),
  },
});

function App() {
  axios.defaults.baseURL = "http://localhost:8000";
  console.log("reloaded app.tsx");

  useEffect(() => {
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

  //   style={{
  //   display: "flex",
  //   justifyContent: "center",
  //   backgroundColor: "#d4d2d0",
  //   height: "100vh",
  // }}

  return (
    <div className="appContainer">
      <SocketContext.Provider value={{ socket }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Lurker" element={<Lurker />} />
          <Route
            path="/lurker/explore"
            element={<Lurker page={<Explore />} />}
          />
          <Route path="/lurker/" element={<Lurker page={<Chat />} />} />
          <Route
            path="/lurker/notifications"
            element={<Lurker page={<Notifications />} />}
          />
          <Route
            path="/lurker/:username"
            element={<Lurker page={<Profile />} />}
          />
        </Routes>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
