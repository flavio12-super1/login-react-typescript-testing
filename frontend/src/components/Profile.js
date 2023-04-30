import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { UserContext } from "./Lurker";
import "../styles/Profile.css";

function Profile() {
  const userData = useContext(UserContext);
  const { socket, myEmail, userID } = userData;
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function checkUserExists(user) {
    try {
      const response = await axiosInstance.get("/getUser", {
        params: {
          email: username,
        },
      });
      console.log(response.data.message);
      if (response.data.message === "success") {
        console.log("success");
        setUser(user);
        return true;
      }
    } catch (error) {
      setUser(null);
      console.log(error);
      return false;
    }
  }

  useEffect(() => {
    axiosInstance
      .get("/verify")
      .then(async (response) => {
        console.log(response.data.username);

        await checkUserExists(response.data.username);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sendFollowRequest = () => {
    const data = {
      user: username,
      email: myEmail,
      userID: userID,
    };
    console.log(data);
    try {
      socket.emit("sendFollowRequest", data);
    } catch (err) {
      console.error(err);
    }
  };

  const OtherUser = () => {
    return (
      <div>
        <button onClick={() => sendFollowRequest()}>follow</button>
        <div>This is someone else's profile</div>
      </div>
    );
  };

  const ProfilePage = () => {
    return (
      <div id="profileOuterDiv">
        <div>
          <img
            src="https://www.primemotorz.com/wp-content/uploads/2019/08/secondary-banner-placeholder.jpg"
            id="banner"
          />
        </div>
        <div>
          <span>Username: </span>
          <div>{username}</div>
          {user && user === username ? (
            <p>This is your own profile.</p>
          ) : (
            <OtherUser />
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="profileOuterDiv">
      {user != null ? <ProfilePage /> : <div>This user does not exist</div>}
    </div>
  );
}

export default Profile;
