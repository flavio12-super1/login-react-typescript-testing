// import React, { useState } from "react";

// const DropArea = () => {
//   const [files, setFiles] = useState([]);

//   const handlePaste = (event) => {
//     const clipboardItems = Array.from(event.clipboardData.items);

//     clipboardItems.forEach((item) => {
//       if (item.kind === "file") {
//         const file = item.getAsFile();
//         setFiles((prevFiles) => [...prevFiles, file]);
//       } else if (item.kind === "string") {
//         item.getAsString((text) => {
//           // Process the pasted text as needed
//           console.log("Pasted text:", text);
//         });
//       }
//     });
//   };

//   const handleDrop = async (event) => {
//     event.preventDefault();

//     const dataTransfer = event.dataTransfer;

//     if (dataTransfer.items) {
//       const droppedFiles = Array.from(dataTransfer.items)
//         .filter((item) => item.kind === "file")
//         .map((item) => item.getAsFile());

//       setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
//     } else {
//       const imageUrl = dataTransfer.getData("text/plain");
//       if (imageUrl) {
//         try {
//           const compressedFile = await compressImageFromUrl(imageUrl);
//           setFiles((prevFiles) => [...prevFiles, compressedFile]);
//         } catch (error) {
//           console.error("Error compressing image:", error);
//         }
//       }
//     }
//   };

//   const handleFileUpload = (event) => {
//     const uploadedFiles = Array.from(event.target.files);

//     setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
//   };

//   const handleDragOver = (event) => {
//     event.preventDefault();
//   };

//   const compressImageFromUrl = async (url) => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const MAX_WIDTH = 500;
//         const MAX_HEIGHT = 500;
//         let width = img.width;
//         let height = img.height;

//         if (width > height) {
//           if (width > MAX_WIDTH) {
//             height *= MAX_WIDTH / width;
//             width = MAX_WIDTH;
//           }
//         } else {
//           if (height > MAX_HEIGHT) {
//             width *= MAX_HEIGHT / height;
//             height = MAX_HEIGHT;
//           }
//         }

//         canvas.width = width;
//         canvas.height = height;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0, width, height);
//         canvas.toBlob(
//           (blob) => {
//             const compressedFile = new File([blob], "compressed.jpg", {
//               type: "image/jpeg",
//               lastModified: Date.now(),
//             });
//             resolve(compressedFile);
//           },
//           "image/jpeg",
//           0.7
//         );
//       };
//       img.onerror = (error) => {
//         reject(error);
//       };
//       img.src = url;
//     });
//   };

//   return (
//     <div
//       onPaste={handlePaste}
//       onDrop={handleDrop}
//       onDragOver={handleDragOver}
//       style={{ width: "300px", height: "200px", border: "1px dashed #ccc" }}
//     >
//       <h3>Drop Area</h3>
//       <input type="file" multiple onChange={handleFileUpload} />
//       <ul>
//         {files.map((file, index) => (
//           <li key={index}>
//             {typeof file === "string" ? (
//               <img
//                 src={file}
//                 alt={`Image ${index}`}
//                 style={{ maxWidth: "100px", maxHeight: "100px" }}
//                 draggable="true"
//               />
//             ) : (
//               <>
//                 {file.name}
//                 <img
//                   src={URL.createObjectURL(file)}
//                   alt={file.name}
//                   style={{ maxWidth: "100px", maxHeight: "100px" }}
//                 />
//               </>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default DropArea;

import React from "react";

const DropArea = () => {
  const handleDrop = (event) => {
    event.preventDefault();
    const imageUrl = event.dataTransfer.getData("text/plain");

    if (imageUrl) {
      console.log("Dropped image URL:", imageUrl);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: "300px", height: "200px", border: "1px dashed #ccc" }}
    >
      <h3>Drop Area</h3>
    </div>
  );
};

export default DropArea;
