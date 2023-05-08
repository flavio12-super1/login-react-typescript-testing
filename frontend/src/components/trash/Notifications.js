import React, { useContext } from "react";
import { UserContext } from "./Lurker";
import { useNavigate } from "react-router-dom";

function Notifications() {
  let navigate = useNavigate();
  const userData = useContext(UserContext);
  const { notifications, friendRequests, denyRequest, acceptRequest } =
    userData;

  const handleNavigate = (username) => {
    navigate("/lurker/" + username);
  };

  const renderNotifications = () => {
    return notifications.map((data, index) => (
      <div key={index} className="">
        <div className="btn">
          Message from: {data.senderEmail} {`->`}
        </div>
        <div className="btn">{data.message}</div>
      </div>
    ));
  };
  const renderFriendRequests = () => {
    return friendRequests.map((data, index) => (
      <div key={index} className="">
        <div className="btn">
          Friend request from:
          <button onClick={() => handleNavigate(data.email)}>
            {data.email}
          </button>
          <div>
            <button className="btn" onClick={() => acceptRequest(data.id)}>
              accept
            </button>
            <button className="btn" onClick={() => denyRequest(data.id)}>
              deny
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div>Notifications</div>
      <div>{renderNotifications()}</div>
      <div>{renderFriendRequests()}</div>
    </div>
  );
}

export default Notifications;
