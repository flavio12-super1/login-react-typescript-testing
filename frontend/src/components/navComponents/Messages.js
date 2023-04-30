import React, { useState } from "react";
import "../../styles/Messages.css";
import "../../styles/Nav.css";
import gear from "../lurker-icons/gear.png";
import binoculars from "../lurker-icons/binoculars.png";
import eye from "../lurker-icons/eye.png";
import eyecross from "../lurker-icons/eyecross.png";
import trash from "../lurker-icons/trash.png";

function Messages() {
  const [searchMessage, setSearchMessage] = useState("");
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
        <div id="messagesInnerDiv">my messages</div>
      </div>
    </div>
  );
}

export default Messages;
