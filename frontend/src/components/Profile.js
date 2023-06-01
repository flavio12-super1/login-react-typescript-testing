import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import styled, { keyframes } from "styled-components";
import { useParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { UserContext } from "./Lurker";
import ColorPicker from "./profileComponents/colorPickerFiles/ColorPicker";
import ProfileImage from "./profileComponents/profileImageFiles/ProfileImage";
import UserBiography from "./profileComponents/bioFiles/UserBiography";
import "../styles/Profile.css";
export const ColorPickerContext = createContext();

function Profile() {
  const userData = useContext(UserContext);
  const { socket, myEmail, userID } = userData;
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [overlay, setOverlay] = useState(false);
  const editProfile = () => {
    setOverlay(!overlay);
  };

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
        console.log(response.data.theme?.bc);
        setUser(user);
        setTheme({
          bc: response.data.theme?.bc || { r: 28, g: 24, b: 38, a: 1 },
          fg: response.data.theme?.fg || { r: 42, g: 39, b: 62, a: 1 },
          bannerURL:
            response.data.theme?.bannerURL ||
            "https://www.primemotorz.com/wp-content/uploads/2019/08/secondary-banner-placeholder.jpg",
          bannerArray: response.data.theme?.bannerArray || [],
          imageURL:
            response.data.theme?.imageURL ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
          imageURLArray: response.data.theme?.imageURLArray || [],
          borderColor: response.data.theme?.borderColor || {
            r: 28,
            g: 24,
            b: 38,
            a: 1,
          },
          uc: response.data.theme?.uc || { r: 127, g: 255, b: 250, a: 1 },
        });
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
        console.log(response.data);
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

  useEffect(() => {
    console.log(theme?.bc.r);
  }, [theme]);

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

  const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

  const OverlayContainer = styled.div`
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const OverlayContent = styled.div`
    background-color: rgb(25 22 44);
    padding: 20px;
    color: white;
    height: -webkit-fill-available;
    width: -webkit-fill-available;
    margin: 40px;
    border: solid;
    animation: ${fadeIn} 0.3s ease;
    position: relative;
    display: flex;
    flex-direction: column;
  `;

  const UserEdits = ({ tempTheme, setTempTheme }) => {
    return (
      <div id="userEditsInnerContainer">
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">Background color: </div>
            <ColorPicker
              tempTheme={tempTheme}
              colorKey="bc"
              setTempTheme={setTempTheme}
            />
          </div>
          <div className="editDivider"></div>
        </div>
        {/* foreground color: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">foreground Color: </div>
            <ColorPicker
              tempTheme={tempTheme}
              colorKey="fg"
              setTempTheme={setTempTheme}
            />
          </div>
          <div className="editDivider"></div>
        </div>
        {/* Banner image: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">
              <ProfileImage
                tempTheme={tempTheme}
                text="Banner Image"
                id="bannerImage"
                uploadKey="bannerURL"
                uploadListKey="bannerArray"
                setTempTheme={setTempTheme}
              />
            </div>
          </div>
          <div className="editDivider"></div>
        </div>
        {/* Profile image: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">
              <ProfileImage
                tempTheme={tempTheme}
                text="Profile Image"
                id="profileImage"
                uploadKey="imageURL"
                uploadListKey="imageURLArray"
                setTempTheme={setTempTheme}
              />
            </div>
          </div>
          <div className="editDivider"></div>
        </div>
        {/* Border color: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">Border Color: </div>
            <ColorPicker
              tempTheme={tempTheme}
              colorKey="borderColor"
              setTempTheme={setTempTheme}
            />
          </div>
          <div className="editDivider"></div>
        </div>
        {/* Username color: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">Username Color: </div>
            <ColorPicker
              tempTheme={tempTheme}
              colorKey="uc"
              setTempTheme={setTempTheme}
            />
          </div>
          <div className="editDivider"></div>
        </div>
        {/* User Bio: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">
              <UserBiography />
            </div>
            {/* <UserBio /> */}
          </div>
          <div className="editDivider"></div>
        </div>
        {/* Bio color: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">Bio Color: </div>
          </div>
          <div className="editDivider"></div>
        </div>
        {/* Count color: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">Count Color: </div>
          </div>
          <div className="editDivider"></div>
        </div>
        {/* Divider color: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">Divider Color: </div>
          </div>
          <div className="editDivider"></div>
        </div>
        {/* Bottom Image: */}
        <div>
          <div className="settingsOptionOuterDiv">
            <div className="settingsOptionInnerDiv">Bottom Image: </div>
          </div>
          <div className="editDivider"></div>
        </div>
      </div>
    );
  };

  const Preview = ({ tempTheme }) => {
    return (
      <div
        id="previewContainer"
        style={{
          backgroundColor: `rgba(${tempTheme?.bc.r}, ${tempTheme?.bc.g}, ${tempTheme?.bc.b}, ${tempTheme?.bc.a})`,
        }}
      >
        <div
          id="preview"
          style={{
            backgroundColor: `rgba(${tempTheme?.fg.r}, ${tempTheme?.fg.g}, ${tempTheme?.fg.b}, ${tempTheme?.fg.a})`,
          }}
        >
          <div>
            <div
              alt="image"
              id="banner"
              style={{ backgroundImage: `url("${tempTheme.bannerURL}")` }}
            />
          </div>
          <div>
            <div id="profileImageDivOuter">
              <div id="profileImageDiv">
                <div
                  alt="image"
                  id="profileImage"
                  style={{
                    backgroundImage: `url("${tempTheme.imageURL}")`,
                    borderColor: `rgba(${tempTheme?.borderColor.r}, ${tempTheme?.borderColor.g}, ${tempTheme?.borderColor.b}, ${tempTheme?.borderColor.a})`,
                  }}
                />
              </div>
              <div
                id="editProfileBtn"
                style={{
                  borderColor: `rgba(${tempTheme?.borderColor.r}, ${tempTheme?.borderColor.g}, ${tempTheme?.borderColor.b}, ${tempTheme?.borderColor.a})`,
                }}
              >
                follow
              </div>
            </div>
            <div className="profileElement">
              <div
                id="usernameDiv"
                style={{
                  color: `rgba(${tempTheme?.uc.r}, ${tempTheme?.uc.g}, ${tempTheme?.uc.b}, ${tempTheme?.uc.a})`,
                }}
              >
                {username}
              </div>
            </div>
            <div className="profileElement">
              <div id="userBioDiv">
                This is the start of a new journey filled with twists and turns
                😊
              </div>
            </div>
            <div className="profileElement countElement">
              <div className="innerCountElement">
                <div className="count">0</div>
                <div className="word">followers</div>
              </div>

              <div className="innerCountElement">
                <div className="count">0</div>
                <div className="word">following</div>
              </div>
            </div>
            <div id="media">No Posts, kinda sus 🤔</div>
          </div>
        </div>
      </div>
    );
  };

  const ActionButtons = ({ saveEdits }) => {
    return (
      <div id="cross">
        <div id="saveBtn" onClick={saveEdits}>
          save
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="35"
          height="35"
          cursor="pointer"
          onClick={editProfile}
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="80" fill="red" />
          <g transform="rotate(45 100 100)">
            <line
              x1="60"
              y1="100"
              x2="140"
              y2="100"
              stroke="white"
              stroke-width="12"
            />
            <line
              x1="100"
              y1="60"
              x2="100"
              y2="140"
              stroke="white"
              stroke-width="12"
            />
          </g>
        </svg>
      </div>
    );
  };

  const OverLay = ({ theme }) => {
    console.log(theme);
    const [tempTheme, setTempTheme] = useState(theme);

    const saveEdits = async () => {
      axiosInstance
        .post("/saveEdits", {
          theme: tempTheme,
        })
        .then(async (response) => {
          console.log(response.data.theme);
          setOverlay(false);
          setTheme(response.data.theme);
          alert("Saved!");
        })
        .catch((error) => {
          console.log(error);
        });
    };
    return (
      <OverlayContainer>
        <OverlayContent>
          <div id="ActionButtonsConatiner">
            <ActionButtons saveEdits={saveEdits} />
          </div>
          <div id="profileEditContainer">
            <div id="userEditsContainer">
              <UserEdits tempTheme={tempTheme} setTempTheme={setTempTheme} />
            </div>
            <div id="previewOuterContainer">
              <Preview tempTheme={tempTheme} />
            </div>
          </div>
        </OverlayContent>
      </OverlayContainer>
    );
  };

  const OtherUser = () => {
    return (
      <div id="editProfileBtn">
        <div onClick={() => sendFollowRequest()}>follow</div>
      </div>
    );
  };

  const ProfilePage = () => {
    return (
      <div
        id="profileOuterDiv"
        style={{
          backgroundColor: `rgba(${theme?.fg.r}, ${theme?.fg.g}, ${theme?.fg.b}, ${theme?.fg.a})`,
        }}
      >
        <div>
          <div
            alt="image"
            id="banner"
            style={{ backgroundImage: `url("${theme.bannerURL}")` }}
          />
        </div>
        <div>
          <div id="profileImageDivOuter">
            <div id="profileImageDiv">
              <div
                style={{
                  backgroundImage: `url("${theme.imageURL}")`,
                  borderColor: `rgba(${theme?.borderColor.r}, ${theme?.borderColor.g}, ${theme?.borderColor.b}, ${theme?.borderColor.a})`,
                }}
                alt=""
                id="profileImage"
              />
            </div>
            {user && user === username ? (
              <div
                id="editProfileBtn"
                onClick={editProfile}
                style={{
                  borderColor: `rgba(${theme?.borderColor.r}, ${theme?.borderColor.g}, ${theme?.borderColor.b}, ${theme?.borderColor.a})`,
                }}
              >
                edit profile
              </div>
            ) : (
              <OtherUser />
            )}
          </div>
          <div className="profileElement">
            <div
              id="usernameDiv"
              style={{
                color: `rgba(${theme?.uc.r}, ${theme?.uc.g}, ${theme?.uc.b}, ${theme?.uc.a})`,
              }}
            >
              {username}
            </div>
          </div>
          <div className="profileElement">
            <div id="userBioDiv">
              This is the start of a new journey filled with twists and turns 😊
            </div>
          </div>
          <div className="profileElement countElement">
            <div className="innerCountElement">
              <div className="count">0</div>
              <div className="word">followers</div>
            </div>

            <div className="innerCountElement">
              <div className="count">0</div>
              <div className="word">following</div>
            </div>
          </div>
          <div id="media">No Posts, kinda sus 🤔</div>
        </div>
        {overlay ? <OverLay theme={theme} /> : null}
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: `rgba(${theme?.bc.r}, ${theme?.bc.g}, ${theme?.bc.b}, ${theme?.bc.a})`,
      }}
      id="profilePage"
    >
      <div id="profileOuterDiv">
        {user != null ? <ProfilePage /> : <div>This user does not exist</div>}
      </div>
    </div>
  );
}

export default Profile;
