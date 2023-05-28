import React from "react";
import "../../../styles/CommonStyles.css";
import "./ProfileImage.css";

function ProfileImage() {
  return (
    <div>
      <div className="displayFlex width100 alighnItemsCenter height50">
        <div className="displayFlex alighnItemsCenter width100">
          Profile Image:
        </div>
        <div className="displayFlex alighnItemsCenter smallIcon-container">
          <span className="material-icons custom-icon-style">insert_photo</span>
          <div className="displayFlex smallIcon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              cursor="pointer"
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="100" r="100" fill="#d54b98" />
              <g transform="rotate(0 100 100)">
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
        </div>
      </div>
      <div className="displayFlex">
        <div className="userProfileImageDiv">
          <img
            src="https://i.pinimg.com/originals/d4/e0/13/d4e01341b8f4bdc193671689aaec2bbb.jpg"
            alt=""
            className="userProfileImage"
          />
        </div>
        <div className="userProfileImageDiv">
          <img
            src="https://i.kym-cdn.com/entries/icons/facebook/000/035/767/cover4.jpg"
            alt=""
            className="userProfileImage"
          />
        </div>
        <div className="userProfileImageDiv">
          <img
            src="https://i.ytimg.com/vi/UiCPytVT4bo/maxresdefault.jpg"
            alt=""
            className="userProfileImage"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileImage;
