import axios from "axios";
import "../styles/Lurker.css";
import React, { useContext, useState, useEffect } from "react";
import { createContext } from "react";
import SocketContext from "../config/SocketContext";
import Nav from "./Nav";
export const UserContext = createContext();

function Lurker(props) {
  const userData = useContext(SocketContext);

  const { socket } = userData;
  const [count, SetCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const myEmail = localStorage.getItem("email");
  console.log("reloaded");

  useEffect(() => {
    const handleMessageReceived = (data) => {
      alert(data.senderEmail + " says: " + data.message);
      console.log(data);
      setNotifications((notification) => [data, ...notification]);
      SetCount((prevCount) => prevCount + 1);
      console.log(data);
    };

    socket.on("message", handleMessageReceived);

    return () => {
      socket.removeAllListeners();
    };
  }, [socket]);

  return (
    <div id="lurkerContainer">
      <UserContext.Provider
        value={{
          count,
          myEmail,
          socket,
          notifications,
        }}
      >
        <Nav />
        {props.page}
      </UserContext.Provider>
    </div>
  );
}

export default Lurker;
