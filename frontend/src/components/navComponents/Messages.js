import React, {
  useRef,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../Lurker";
import axiosInstance from "../../config/axiosConfig";
import "../../styles/Messages.css";
import "../../styles/Nav.css";
import gear from "../lurker-icons/gear.png";
import conversation from "../lurker-icons/conversation.png";
import binoculars from "../lurker-icons/binoculars.png";
import eye from "../lurker-icons/eye.png";
import eyecross from "../lurker-icons/eyecross.png";
import trash from "../lurker-icons/trash.png";

import Groups from "./Groups";
import FileUploades from "./FileUploades";
import Drag from "./Drag";

import SlateInput from "./SlateInput";
import { set } from "immutable";
export const EventContext = createContext();

function Messages() {
  let navigate = useNavigate();
  const userData = useContext(UserContext);
  const { socket, myEmail, userID, friendsList } = userData;
  let { channelID } = useParams();
  channelID ??= null;
  const [room, setRoom] = useState({ room: channelID });
  const [chat, setChat] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const myRef = useRef(null);

  // const [postMessageId, setPostMessageId] = useState({
  //   username: "",
  //   postMessageId: "",
  // });

  useEffect(() => {
    setRoom({ room: channelID });
  }, [channelID]);

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

  //render images
  const renderDataImg = (allImg) => {
    return allImg.map((img, index) => (
      <div key={index}>
        <img src={img} className="myImage" alt="" />
      </div>
    ));
  };

  //render chat
  const renderChat = () => {
    return chat.map((data, index) => (
      <div key={index} className="messageContainer">
        <div>
          {data.images ? <div>{renderDataImg(data.images)}</div> : null}
          <div className="username">{data.username}</div>
          <div className="messageDiv">{renderChatMessages(data.message)}</div>
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

  // useEffect(() => {
  //   myRef.current?.scrollIntoView({
  //     behavior: "smooth",
  //     block: "end",
  //   });
  //   console.log("chat was updated");
  // }, [chat]);

  // const chatContainerRef = useRef(null);
  // const chatMessagesRef = useRef(null);

  // useEffect(() => {
  //   const chatContainer = chatContainerRef.current;

  //   const handleScroll = () => {
  //     const { scrollTop, clientHeight, scrollHeight } = chatContainer;
  //     const isAtBottom = scrollTop + clientHeight >= scrollHeight;
  //     if (isAtBottom) {
  //       chatContainer.style.scrollBehavior = "smooth";
  //     } else {
  //       chatContainer.style.scrollBehavior = "auto";
  //     }
  //   };

  //   chatContainer.addEventListener("scroll", handleScroll);

  //   return () => {
  //     chatContainer.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  // useEffect(() => {
  //   chatContainerRef.current.scrollTo({
  //     top: chatMessagesRef.current.clientHeight,
  //   });
  // }, [chat]);

  const chatContainerRef = useRef(null);
  const [userScrolledToBottom, setUserScrolledToBottom] = useState(1);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;

    const handleScroll = (e) => {
      const { scrollTop, clientHeight, scrollHeight } = chatContainer;
      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
      // setUserScrolledToBottom(isAtBottom);
      if (isAtBottom) {
        console.log("user scrolled to bottom");
        setUserScrolledToBottom(1);
      } else {
        console.log("user scrolling");
        setUserScrolledToBottom(0);
      }
      if (!isAtBottom) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    chatContainer?.addEventListener("scroll", handleScroll);

    return () => {
      chatContainer?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const chatContainer = chatContainerRef?.current;
    if (chatContainer) {
      const { scrollHeight, clientHeight } = chatContainer;

      if (userScrolledToBottom == 1) {
        chatContainer.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: "smooth",
        });
      } else {
        console.log("pain");
      }
    }
    // const { scrollHeight, clientHeight } = chatContainer;

    // if (userScrolledToBottom == 1) {
    //   chatContainer.scrollTo({
    //     top: scrollHeight - clientHeight,
    //     behavior: "smooth",
    //   });
    // } else {
    //   console.log("pain");
    // }
  }, [chat]);

  const handleScrollToBottom = () => {
    console.log("scrolling to the bottom when shift enter pressed");
    myRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const [shift, setShift] = useState(0);

  const handleKeyPress = (event) => {
    // const chatContainer = chatContainerRef.current;
    // const { scrollHeight, clientHeight } = chatContainer;
    // setShift(event.shiftKey);

    // if (event.shiftKey && event.which === 13) {

    // if (userScrolledToBottom == 1) {
    //   handleScrollToBottom();
    // } else {
    //   console.log("pain");
    // }
    // if (userScrolledToBottom == 1) {
    // chatContainer.scrollTo({
    //   top: scrollHeight - clientHeight + 50,
    //   behavior: "smooth",
    // });
    // myRef.current?.scrollIntoView({
    //   behavior: "smooth",
    //   block: "end",
    // });
    // if (myRef.current) {
    //   console.log(".....scrolling.....to.......bottom");
    //   myRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    // }
    const chatContainer = chatContainerRef.current;
    const { scrollHeight, clientHeight } = chatContainer;
    // console.log(
    //   "scrollHeight: " +
    //     scrollHeight +
    //     " - " +
    //     "clientHeight: " +
    //     clientHeight +
    //     " = " +
    //     scrollHeight -
    //     clientHeight
    // );
    console.log(scrollHeight);
    console.log(clientHeight);

    // chatContainer.scrollTo({
    //   top: scrollHeight + 1000,
    // });

    // }
    console.log("shift enter pressed");

    // }

    // console.log("shift enter pressed");
  };

  useEffect(() => {
    console.log("scroll updated");
    if (userScrolledToBottom == 1) {
      console.log("user scrolled to bottom");
    } else if (userScrolledToBottom == 0) {
      console.log("user scrolling");
    }
  }, [userScrolledToBottom]);

  //send message
  const onMessageSubmit = async (messages) => {
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("image", files[0]);
      await axiosInstance.post("/api/posts", formData).then((res) => {
        console.log(res.data);

        console.log(messages);
        const data = {
          images: [res.data],
          message: messages,
          channelID: channelID,
        };
        socket.emit("message", data);
      });
    } else {
      console.log(messages);
      const data = {
        message: messages,
        channelID: channelID,
      };
      socket.emit("message", data);
    }
    // console.log(messages);
    // const data = {
    //   message: messages,
    //   channelID: channelID,
    // };
    // socket.emit("message", data);
  };

  const handleNavigate = (channelID) => {
    // socket.emit("leaveRoom", room.room);
    // navigate("/lurker/channel/messages/" + channelID);
    socket.emit("leaveRoom", room.room, () => {
      // Callback function called when the "leaveRoom" event is acknowledged
      setChat([]);
      // Navigate to the new room
      navigate("/lurker/channel/messages/" + channelID);
    });
  };
  //render friend list
  const renderFriendList = () => {
    return friendsList.map((data, index) => (
      <div key={index} id="">
        <div className="">
          <button className="" onClick={() => handleNavigate(data.channelID)}>
            {data.email}
          </button>
        </div>
      </div>
    ));
  };

  //handle image uploads
  const [files, setFiles] = useState([]);
  // const [hasFile, setHasFile] = useState(false);

  const handlePaste = (event) => {
    const clipboardItems = Array.from(event.clipboardData.items);

    // Check if there is a file in the clipboardItems
    const hasFileInClipboard = clipboardItems.some(
      (item) => item.kind === "file"
    );

    clipboardItems.forEach((item) => {
      if (item.kind === "file") {
        const file = item.getAsFile();
        console.log(file);
        setFiles((prevFiles) => [...prevFiles, file]);
      } else if (item.kind === "string" && !hasFileInClipboard) {
        item.getAsString((text) => {
          // Process the pasted text as needed

          if (text.substring(0, 5) === "https") {
            console.log("Pasted text:", text);
            setFiles((prevFiles) => [...prevFiles, text]);
          }
        });
      }
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const dataTransfer = event.dataTransfer;

    if (dataTransfer.items) {
      const droppedFiles = Array.from(dataTransfer.items)
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile());

      setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    } else {
      const droppedFiles = Array.from(dataTransfer.files);

      setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    }

    const imageUrl = event.dataTransfer.getData("text/html");
    const rex = /src="?([^"\s]+)"?\s*/;
    const url = rex.exec(imageUrl);
    // console.log(url[1]);
    const cleanedUrl = url[1].replace(/&amp;/g, "&"); // Remove all occurrences of '&amp;'
    console.log(cleanedUrl);
    // setFiles((prevFiles) => [
    //   ...prevFiles,
    //   [{ imageURL: cleanedUrl, imageType: "url" }],
    // ]);
    setFiles((prevFiles) => [...prevFiles, cleanedUrl]);
  };

  const handleFileUpload = async (onMessageSubmit) => {
    const formData = new FormData();
    formData.append("image", files[0]);
    await axiosInstance.post("/api/posts", formData).then((res) => {
      console.log(res.data);
      onMessageSubmit(onMessageSubmit);
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", event.target.src);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
  };

  const handleDragOverImage = (event) => {
    event.preventDefault();
  };

  const handleDropImage = (event) => {
    event.preventDefault();
    const imageUrl = event.dataTransfer.getData("text/plain");
    setFiles((prevFiles) => [...prevFiles, imageUrl]);
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            0.7
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const compressedFiles = await Promise.all(uploadedFiles.map(compressImage));

    setFiles((prevFiles) => [...prevFiles, ...compressedFiles]);
  };

  //scroll behavior for messages
  // const chatContainerRef = useRef(null);
  // const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // // Function to handle new messages
  // const handleNewMessage = () => {
  //   // Your logic to add the new message

  //   // Check if user is already at the bottom
  //   const { scrollTop, clientHeight, scrollHeight } = chatContainerRef.current;
  //   const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

  //   // Set shouldScrollToBottom based on user's scroll position
  //   setShouldScrollToBottom(isAtBottom);
  // };

  // // Scroll to the bottom of the chat container on initial load
  // useEffect(() => {
  //   chatContainerRef.current.scrollIntoView({ behavior: "auto" });
  // }, []);

  // // Add scroll event listener to track user's scroll position
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const { scrollTop, clientHeight, scrollHeight } =
  //       chatContainerRef.current;
  //     const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
  //     setShouldScrollToBottom(isAtBottom);
  //   };

  //   chatContainerRef.current.addEventListener("scroll", handleScroll);

  //   return () => {
  //     chatContainerRef.current.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  // // Scroll to the bottom if user is already at the bottom and shouldScrollToBottom is true
  // useEffect(() => {
  //   if (shouldScrollToBottom) {
  //     chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [shouldScrollToBottom]);

  return (
    <div
      id="messagesOuterDiv"
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onKeyDown={(event) => handleKeyPress(event)}
    >
      {/* <div id="messagesNav">
        Search message, recently sent, recently viewed, still on read, recently
        deleted, settings
      </div> */}
      <div id="messagesNavContainer">
        <div id="searchMessages">
          <div className="messagesNavElements">
            <div className="navStyle">
              <div className="divImg">
                <div id="conversationBtn">
                  <div>Find A Conversation</div>
                  <img
                    id="navSmallIcon"
                    src={conversation}
                    alt="conversation"
                  />
                </div>
              </div>
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
        <div style={{ display: "flex" }}>
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
          <div className="navSettingsStyle">
            <div className="divImg">
              <img className="navIcons" src={gear} alt="spider" />
            </div>
          </div>
        </div>
      </div>
      {/* binoculars.png */}
      <div id="messagesInnerDivContainer">
        <div id="messagesInnerDiv">
          <div id="messagesInnerDivLeft">
            <div>{renderFriendList()}</div>
          </div>

          {channelID != null ? (
            <div id="chatDiv">
              {/* <div id="chatMessagesDiv" ref={chatContainerRef}>
                <div ref={chatMessagesRef}>
                  <div>
                    <h1>This is the start of a new Converstaion</h1>
                  </div>
                  {renderChat().reverse()}
                </div>
              </div> */}
              <div id="chatMessagesDiv" ref={chatContainerRef}>
                <div style={{ overflowAnchor: "none" }}>
                  {/* <div id="innerChatMessagesDiv"> */}
                  <div>
                    {renderChat().reverse()}
                    <div ref={myRef}></div>
                  </div>
                </div>
              </div>
              {/* <div ref={chatContainerRef} /> */}
              {/* here */}
              <div id="outerSlateDiv">
                <div style={{ flexGrow: "1" }}>
                  <div id="imageContainer">
                    {files.map((file, index) => (
                      <div key={index}>
                        {typeof file === "string" ? (
                          <div
                            className="innerImageContainer"
                            style={
                              file.substring(0, 5) === "https"
                                ? { border: "dotted red 4px" }
                                : { border: "dotted black" }
                            }
                          >
                            <img
                              src={file}
                              alt={`Image url`}
                              style={{
                                maxWidth: "190px",
                                maxHeight: "190px",
                              }}
                              draggable="true"
                              onDragStart={handleDragStart}
                              onDragEnter={handleDragEnter}
                              onDragLeave={handleDragLeave}
                              onDragOver={handleDragOverImage}
                              onDrop={handleDropImage}
                            />
                          </div>
                        ) : (
                          <div
                            className="innerImageContainer"
                            style={{ border: "solid black" }}
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              style={{
                                maxWidth: "190px",
                                maxHeight: "190px",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div id="inputOuterContainer">
                    <div style={{ flexGrow: "1" }}>
                      <EventContext.Provider
                        value={{
                          room,
                          setFiles,
                        }}
                      >
                        <SlateInput onMessageSubmit={onMessageSubmit} />
                        {/* <SlateInput
                          onMessageSubmit={() =>
                            handleFileUpload(onMessageSubmit)
                          }
                        /> */}
                      </EventContext.Provider>
                    </div>
                    <div id="imgButtonDiv">
                      <input
                        type="file"
                        name="image-upload"
                        id="input"
                        multiple
                        onChange={handleFileChange}
                      />
                      <div id="labelDiv">
                        <label htmlFor="input" className="image-upload">
                          <i className="material-icons">add_photo_alternate</i>
                        </label>
                      </div>
                      {/* <div>
                      <button onClick={handleFileUpload}>upload</button>
                    </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              no channel selected : (
              <Groups />
              <FileUploades />
            </div>
          )}
          {/* <div>my messages!!</div>
          {renderChat().reverse()}
          <EventContext.Provider
            value={{
              postMessageId,
            }}
          >
            <SlateInput onMessageSubmit={onMessageSubmit} />
          </EventContext.Provider> */}
        </div>
      </div>
    </div>
  );
}

export default Messages;
