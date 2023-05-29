import React, { useContext, useEffect, useState, useRef } from "react";
import { ChromePicker } from "react-color";
import { ColorPickerContext } from "../Profile.js";
import "./ColorPicker.css";

const ColorPicker = ({ selectedColor, setSelectedColor }) => {
  const [showPicker, setShowPicker] = useState(false);

  const colorPickerRef = useRef(null);

  console.log(selectedColor);
  const handleColorChange = (color) => {
    // setSelectedColor(color.rgb);
    setSelectedColor((prevState) => ({
      ...prevState,
      theme: color.rgb,
    }));
  };

  const handleClickOutside = (e) => {
    if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
      setShowPicker(false);
    }
  };

  // Attach click event listener to handle clicks outside the color picker
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleColorPickerClick = () => {
    setShowPicker(!showPicker);
  };

  return (
    <div ref={colorPickerRef} id="colorPickerContainer">
      <div className="color-picker-input" onClick={handleColorPickerClick}>
        <span className="material-icons">format_paint</span>
        <div
          className="color-picker-selected-color"
          style={{
            backgroundColor: `rgba(${selectedColor?.r}, ${selectedColor?.g}, ${selectedColor?.b}, ${selectedColor?.a})`,
          }}
        ></div>
      </div>

      {showPicker && (
        <div className="color-picker-popup">
          <ChromePicker
            color={selectedColor}
            onChange={handleColorChange}
            disableAlpha={false}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
// import React, { useState } from "react";

// const ColorPicker = () => {
//   const [selectedColor, setSelectedColor] = useState("#000000");
//   const [alpha, setAlpha] = useState(1);

//   const handleColorChange = (e) => {
//     setSelectedColor(e.target.value);
//   };

//   const handleAlphaChange = (e) => {
//     setAlpha(e.target.value);
//   };

//   const getColorWithAlpha = () => {
//     return `${selectedColor}${Math.round(alpha * 255).toString(16)}`;
//   };

//   return (
//     <div>
//       <input type="color" value={selectedColor} onChange={handleColorChange} />
//       <input
//         type="range"
//         min="0"
//         max="1"
//         step="0.01"
//         value={alpha}
//         onChange={handleAlphaChange}
//       />
//       <div
//         style={{
//           width: "100px",
//           height: "100px",
//           backgroundColor: getColorWithAlpha(),
//         }}
//       ></div>
//     </div>
//   );
// };

// export default ColorPicker;

// import React, { useEffect, useState, useRef } from "react";

// const ColorPicker = () => {
//   const [selectedColor, setSelectedColor] = useState("#000000");
//   const [alpha, setAlpha] = useState(1);
//   const [showPicker, setShowPicker] = useState(false);

//   const colorPickerRef = useRef(null);

//   const handleColorChange = (e) => {
//     setSelectedColor(e.target.value);
//   };

//   const handleAlphaChange = (e) => {
//     setAlpha(e.target.value);
//   };

//   const getColorWithAlpha = () => {
//     return `${selectedColor}${Math.round(alpha * 255).toString(16)}`;
//   };

//   const handleColorPickerClick = () => {
//     setShowPicker(!showPicker);
//   };

//   const handleClickOutside = (e) => {
//     if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
//       setShowPicker(false);
//     }
//   };

//   // Attach click event listener to handle clicks outside the color picker
//   useEffect(() => {
//     document.addEventListener("click", handleClickOutside);
//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div ref={colorPickerRef}>
//       <div className="color-picker-input" onClick={handleColorPickerClick}>
//         <span className="material-icons">brush</span>
//         <div
//           className="color-picker-selected-color"
//           style={{ backgroundColor: selectedColor }}
//         ></div>
//       </div>
//       {showPicker && (
//         <div className="color-picker-popup">
//           <input
//             type="color"
//             value={selectedColor}
//             onChange={handleColorChange}
//           />
//           <input
//             type="range"
//             min="0"
//             max="1"
//             step="0.01"
//             value={alpha}
//             onChange={handleAlphaChange}
//           />
//           <div
//             className="color-picker-preview"
//             style={{ backgroundColor: getColorWithAlpha() }}
//           ></div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ColorPicker;

// import React, { useState, useRef } from "react";
// import { ChromePicker } from "react-color";
// import { MdBrush } from "react-icons/md";
// import "./ColorPicker.css";

// const ColorPicker = () => {
//   const [selectedColor, setSelectedColor] = useState("#000000");
//   const [showPicker, setShowPicker] = useState(false);

//   const colorPickerRef = useRef(null);

//   const handleColorChange = (color) => {
//     setSelectedColor(color.hex);
//   };

//   const handleClickOutside = (e) => {
//     if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
//       setShowPicker(false);
//     }
//   };

//   // Attach click event listener to handle clicks outside the color picker
//   useEffect(() => {
//     document.addEventListener("click", handleClickOutside);
//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   const handleColorPickerClick = () => {
//     setShowPicker(!showPicker);
//   };

//   return (
//     <div ref={colorPickerRef}>
//       <div className="color-picker-input" onClick={handleColorPickerClick}>
//         <MdBrush className="paintbrush-icon" />
//         <div
//           className="color-picker-selected-color"
//           style={{ backgroundColor: selectedColor }}
//         ></div>
//       </div>
//       {showPicker && (
//         <div className="color-picker-popup">
//           <ChromePicker
//             color={selectedColor}
//             onChange={handleColorChange}
//             disableAlpha={false}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ColorPicker;

// import React, { useEffect, useState, useRef } from "react";
// import { ChromePicker } from "react-color";
// import "./ColorPicker.css";

// const ColorPicker = () => {
//   const [selectedColor, setSelectedColor] = useState("#000000");
//   const [showPicker, setShowPicker] = useState(false);

//   const colorPickerRef = useRef(null);

//   const handleColorChange = (color) => {
//     setSelectedColor(color.hex);
//   };

//   const handleClickOutside = (e) => {
//     if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
//       setShowPicker(false);
//     }
//   };

//   // Attach click event listener to handle clicks outside the color picker
//   useEffect(() => {
//     document.addEventListener("click", handleClickOutside);
//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   const handleColorPickerClick = () => {
//     setShowPicker(!showPicker);
//   };

//   return (
//     <div ref={colorPickerRef}>
//       <div className="color-picker-input" onClick={handleColorPickerClick}>
//         <span className="material-icons">format_paint</span>
//         <div
//           className="color-picker-selected-color"
//           style={{ backgroundColor: selectedColor }}
//         ></div>
//       </div>

//       {showPicker && (
//         <div className="color-picker-popup">
//           <ChromePicker
//             color={selectedColor}
//             onChange={handleColorChange}
//             disableAlpha={false}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ColorPicker;
//   const userEdites = useContext(ColorPickerContext);
//   const { selectedColor, setSelectedColor } = userEdites;
//   const [selectedColor, setSelectedColor] = useState({
//     hex: "#000000",
//     alpha: 1,
//   });
