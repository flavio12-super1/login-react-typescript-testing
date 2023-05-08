import React, { useState, createContext, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../Lurker";
import axiosInstance from "../../config/axiosConfig";
import "../../styles/Messages.css";
import "../../styles/Nav.css";
import gear from "../lurker-icons/gear.png";
import binoculars from "../lurker-icons/binoculars.png";
import eye from "../lurker-icons/eye.png";
import eyecross from "../lurker-icons/eyecross.png";
import trash from "../lurker-icons/trash.png";

import SlateInput from "./SlateInput";
export const EventContext = createContext();

function Messages() {
  const userData = useContext(UserContext);
  const { socket, myEmail, userID } = userData;
  const { channelID } = useParams();
  channelID ??= null;
  const [room, setRoom] = useState({ room: channelID });
  const [chat, setChat] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");

  const [postMessageId, setPostMessageId] = useState({
    username: "",
    postMessageId: "",
  });

  //update room
  useEffect(() => {
    if (room.room != null) {
      axiosInstance({
        method: "POST",
        data: {
          roomID: room.room,
        },
        withCredentials: true,
        url: "/getMessages",
      })
        .then((res) => {
          console.log(res.data);
          socket.emit("joinRoom", room.room);
          console.log("joined: " + room.room + " successfuly");
        })
        .catch((err) => console.log(err));
    } else {
      console.log("user has joined no room");
    }
  }, [room]);

  //json parse each message
  const parseMessage = (myMessage) => {
    myMessage = JSON.stringify(myMessage.children[0].text);
    if (myMessage.length > 2) {
      return JSON.parse(myMessage);
    }
    return <br />;
  };

  //render each message
  const renderChatMessages = (allMsg) => {
    return allMsg.map((msg, index) => (
      <div key={index}>
        <div>
          <div className="messageOuterDiv">
            <div className="messageDiv">{parseMessage(msg)}</div>
          </div>
        </div>
      </div>
    ));
  };

  //render chat
  const renderChat = () => {
    return chat.map((data, index) => (
      <div key={index}>
        <div>
          <div>{renderChatMessages(data.message)}</div>
        </div>
      </div>
    ));
  };

  function updateChat(data) {
    setChat((chat) => [data, ...chat]);
  }
  //recieve messages
  useEffect(() => {
    socket.on("message", (data) => {
      console.log(data);
      updateChat(data);
    });
  }, []);

  useEffect(() => {
    console.log("chat was updated");
  }, [chat]);

  //send message
  const onMessageSubmit = (messages) => {
    console.log(messages);
    const data = {
      message: messages,
      channelID: channelID,
    };
    socket.emit("message", data);
  };

  return (
    <div id="messagesOuterDiv">
      {/* <div id="messagesNav">
        Search message, recently sent, recently viewed, still on read, recently
        deleted, settings
      </div> */}
      <div id="messagesNavContainer">
        <div id="searchMessages">
          <div id="messagesNavSearch">
            <div id="messagesNavSearchDiv">
              <input
                id="messagesNavSearchDivInput"
                value={searchMessage}
                onChange={(e) => setSearchMessage(e.target.value)}
                placeholder="search messages"
              />
            </div>
            <div id="messagesNavIconDiv">
              <img id="messagesNavIconDivImage" src={binoculars} alt="spider" />
            </div>
          </div>
          <div className="messagesNavElements">
            <div className="navStyle">
              <div className="divImg">
                <img className="navIcons" src={eye} alt="eye" />
              </div>
            </div>
          </div>
          <div className="messagesNavElements">
            <div className="navStyle">
              <div className="divImg">
                <img className="navIcons" src={eyecross} alt="eyecross" />
              </div>
            </div>
          </div>
          <div className="messagesNavElements">
            <div className="navStyle">
              <div className="divImg">
                <img className="navIcons" src={trash} alt="trash" />
              </div>
            </div>
          </div>
        </div>
        <div className="navStyle">
          <div className="divImg"></div>
        </div>
        <div>
          <div className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={gear} alt="spider" />
            </div>
          </div>
        </div>
      </div>
      {/* binoculars.png */}
      <div id="messagesInnerDivContainer">
        <div id="messagesInnerDiv">
          <div>my messages!!</div>
          {renderChat().reverse()}
          <EventContext.Provider
            value={{
              postMessageId,
            }}
          >
            <SlateInput onMessageSubmit={onMessageSubmit} />
          </EventContext.Provider>
        </div>
      </div>
    </div>
  );
}

export default Messages;
