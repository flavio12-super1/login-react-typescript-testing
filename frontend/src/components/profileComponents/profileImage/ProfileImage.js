import React, { useState, useEffect } from "react";
import "../../../styles/CommonStyles.css";
import "./ProfileImage.css";

const ImageArray = () => {
  const initialImages = [
    "https://i.pinimg.com/originals/d4/e0/13/d4e01341b8f4bdc193671689aaec2bbb.jpg",
    "https://i.kym-cdn.com/entries/icons/facebook/000/035/767/cover4.jpg",
    "https://i.ytimg.com/vi/UiCPytVT4bo/maxresdefault.jpg",
    "https://yt3.googleusercontent.com/JVTJHpdwc5AR6ntZu96w-K0M44uLx93RUnUfSFaSMb-BL6cyw4T6ipXJOIpKNbBUQV0fdju7=s900-c-k-c0x00ffffff-no-rj",
  ];

  const [images, setImages] = useState(initialImages);

  const removeImg = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1); // Remove the image at the specified index

    setImages(updatedImages);
  };

  return (
    <div className="displayFlex">
      {images.map((imageUrl, index) => (
        <div className="userProfileImageDiv" key={index}>
          <div>
            <img src={imageUrl} alt="" className="userProfileImage" />
          </div>
          <div className="removeImg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              cursor="pointer"
              onClick={() => removeImg(index)} // Pass the index to removeImg function
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
                  strokeWidth="12"
                />
                <line
                  x1="100"
                  y1="60"
                  x2="100"
                  y2="140"
                  stroke="white"
                  strokeWidth="12"
                />
              </g>
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

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

      <div>
        <ImageArray />
      </div>
    </div>
  );
}

export default ProfileImage;
