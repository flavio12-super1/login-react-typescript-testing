import React, { useContext } from "react";
import { UserContext } from "./Lurker";

function Notifications() {
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

  return (
    <div>
      <div>Notifications</div>
      <div>{renderNotifications()}</div>
    </div>
  );
}

export default Notifications;
