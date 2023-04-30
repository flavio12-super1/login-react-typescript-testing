import axios from "axios";
import "../styles/Lurker.css";
import { useNavigate } from "react-router-dom";
import React, { useContext, useState, useEffect } from "react";
import { createContext } from "react";
import SocketContext from "../config/SocketContext";
import axiosInstance from "../config/axiosConfig";
import Nav from "./Nav";
export const UserContext = createContext();

function Lurker(props) {
  const userData = useContext(SocketContext);

  const { socket } = userData;
  const [count, SetCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequest] = useState([]);
  const myEmail = localStorage.getItem("email");
  const userID = localStorage.getItem("userID");
  let navigate = useNavigate();
  console.log("reloaded");

  useEffect(() => {
    axiosInstance
      .get("http://localhost:8000/userData")
      .then((response) => {
        // alert(response.data.message);
        console.log(response);
        // setFriendRequest((notification) => [
        //   response.data.notifications[0],
        //   ...notification,
        // ]);
        setFriendRequest((notification) => [
          ...response.data.notifications.map((user) => ({
            email: user.email,
            id: user.id,
          })),
          ...notification,
        ]);
      })
      .catch((err) => {
        console.log(err);
      });
    const handleMessageReceived = (data) => {
      alert(data.senderEmail + " says: " + data.message);
      console.log(data);
      setNotifications((notification) => [data, ...notification]);
      SetCount((prevCount) => prevCount + 1);
    };
    const handleFriendReuest = (data) => {
      alert("Friend request from" + data.email);
      console.log(data);
      setFriendRequest((notification) => [data, ...notification]);
      SetCount((prevCount) => prevCount + 1);
    };
    const handleFriendRequestAccepted = (data) => {
      // alert("Friend request from" + data.myEmail);
      console.log(data);
      alert(data.channelID);
      navigate("/lurker/channel/messages/" + data.channelID);

      // setFriendRequest((notification) => [data, ...notification]);
      // SetCount((prevCount) => prevCount + 1);
    };

    socket.on("message", handleMessageReceived);
    socket.on("friendRequest", handleFriendReuest);
    socket.on("friendRequestAccepted", handleFriendRequestAccepted);

    return () => {
      socket.removeAllListeners();
    };
  }, [socket]);

  function denyRequest(id) {
    // socket.emit("denyRequest", username, myEmail);
    let filteredArray = friendRequests.filter((item) => item.id !== id);
    setFriendRequest(filteredArray);
    alert("friend request denied: " + id);
  }

  function acceptRequest(id) {
    const data = {
      id: id,
      userID: userID,
    };
    socket.emit("acceptRequest", data);
    let filteredArray = friendRequests.filter((item) => item.id !== id);
    setFriendRequest(filteredArray);
    alert("friend request accepted: " + id);
  }

  return (
    <div id="lurkerContainer">
      <UserContext.Provider
        value={{
          count,
          myEmail,
          userID,
          socket,
          notifications,
          friendRequests,
          denyRequest,
          acceptRequest,
        }}
      >
        <Nav />
        <div id="lurkerPage">{props.page}</div>
      </UserContext.Provider>
    </div>
  );
}

export default Lurker;
