import axios from "axios";
import "../styles/Hidden.css";
import React, { useContext, useState, useEffect } from "react";
import SocketContext from "../config/SocketContext";
import { useNavigate } from "react-router-dom";

function Hidden() {
  const userData = useContext(SocketContext);
  const { socket } = userData;
  const [roomName, setRoomName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [count, SetCount] = useState(0);

  const createRoom = () => {
    console.log("creating new room");
    try {
      socket.emit("createRoom", roomName);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    console.log("sending message to: " + email);
    const data = {
      senderEmail: localStorage.getItem("email"),
      email: email,
      message: message,
    };
    try {
      socket.emit("sendMessage", data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleRoomCreated = (roomID) => {
      alert("room created: " + roomID);
      console.log(roomID);
    };

    const handleMessageReceived = (data) => {
      alert(data.senderEmail + " says: " + data.message);
      SetCount(count + 1);
      console.log(data);
    };

    socket.on("roomID", handleRoomCreated);
    socket.on("message", handleMessageReceived);

    return () => {
      socket.removeAllListeners();
    };
  }, [socket]);

  let navigate = useNavigate();

  function handleClick() {
    navigate("/notifications");
  }

  return (
    <div>
      <div>Hidden</div>
      <div>
        <button onClick={handleClick}>notifications</button>
        <div>{count}</div>
      </div>
      {localStorage.getItem("email")}

      <div className="inputStyle">
        <span>name: </span>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
      </div>
      <button onClick={() => createRoom()}>create room</button>

      <div className="inputStyle">
        <span>email: </span>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="inputStyle">
        <span>message: </span>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <button onClick={() => sendMessage()}>send</button>
    </div>
  );
}

export default Hidden;
