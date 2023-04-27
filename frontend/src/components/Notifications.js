import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./Lurker";

function Notifications() {
  let navigate = useNavigate();
  const userData = useContext(UserContext);
  const { notifications } = userData;

  const renderNotifications = () => {
    return notifications.map((data, index) => (
      <div key={index} className="">
        <div className="btn">
          Message from: {data.email} {`->`}
        </div>
        <div className="btn">{data.message}</div>
      </div>
    ));
  };

  function handleClick() {
    navigate("/lurker");
  }

  return (
    <div>
      <div>Notifications</div>
      <div>
        <button onClick={handleClick}>lurker</button>
      </div>
      <div>{renderNotifications()}</div>
    </div>
  );
}

export default Notifications;
