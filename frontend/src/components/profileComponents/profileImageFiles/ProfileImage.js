import React, { useState, useEffect } from "react";
import "../../../styles/CommonStyles.css";
import "./ProfileImage.css";
import axiosInstance from "../../../config/axiosConfig";

const ImageArray = ({ tempTheme, uploadKey, uploadListKey, setTempTheme }) => {
  const removeImg = (index) => {
    const updatedImages = [...tempTheme?.[uploadListKey]];
    updatedImages.splice(index, 1); // Remove the image at the specified index

    setTempTheme((prevState) => ({
      ...prevState,
      [uploadListKey]: updatedImages,
    }));
  };

  const handleImageClick = (imageUrl) => {
    setTempTheme({ ...tempTheme, [uploadKey]: imageUrl });
  };
  return (
    <div className="displayFlex">
      {tempTheme?.[uploadListKey].map((imageUrl, index) => (
        <div className="userProfileImageDiv" key={index}>
          <div
            className={`divImage ${
              imageUrl === tempTheme?.[uploadKey]
                ? "selectedImage"
                : "unSelected"
            }`}
            key={index}
            onClick={() => handleImageClick(imageUrl)}
          >
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

function ProfileImage({ tempTheme, uploadKey, uploadListKey, setTempTheme }) {
  const [files, setFiles] = useState([]);

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
    const compressedImageUrls = compressedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    console.log(compressedImageUrls);

    const formData = new FormData();
    compressedFiles.forEach((file) => {
      formData.append("image", file); // Use compressedFiles instead of files
    });

    axiosInstance.post("/api/posts", formData).then((res) => {
      console.log(res.data);
      setTempTheme((prevState) => ({
        ...prevState,
        [uploadListKey]: [...prevState[uploadListKey], res.data],
      }));
    });
  };

  const checkSpace = () => {
    if (tempTheme?.[uploadListKey].length >= 4)
      alert("You can upload only 4 images, please delete one image");
  };
  return (
    <div>
      <div className="displayFlex width100 alighnItemsCenter height50">
        <div className="displayFlex alighnItemsCenter width100">
          Profile Image:
        </div>
        <div onClick={() => checkSpace()}>
          <label
            htmlFor="input"
            className="displayFlex alighnItemsCenter smallIcon-container image-upload"
          >
            <span className="material-icons custom-icon-style">
              insert_photo
            </span>
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
          </label>
          <input
            type="file"
            name="image-upload"
            id="input"
            accept="image/jpeg, image/png"
            style={{ display: "none" }} // Add this style to hide the file input
            onChange={handleFileChange}
            disabled={tempTheme?.[uploadListKey].length >= 4}
          />
        </div>
      </div>
      <div>
        <ImageArray
          tempTheme={tempTheme}
          uploadKey={uploadKey}
          uploadListKey={uploadListKey}
          setTempTheme={setTempTheme}
        />
      </div>
    </div>
  );
}

export default ProfileImage;
