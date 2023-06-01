// import React, { useEffect, useState, useRef } from "react";
// import "./UserBio.css";
// import "../../../styles/CommonStyles.css";
// import EmojiPicker from "./EmojiPicker";
// import SlateInput from "./SlateInput";
// export const EventContext = createContext();

// export const OverLay = () => {
//   const [showEmojiOverLay, setShowEmojiOverLay] = useState(false);
//   const overLayRef = useRef(null);

//   const handleClickOutside = (e) => {
//     if (overLayRef.current && !overLayRef.current.contains(e.target)) {
//       setShowEmojiOverLay(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("click", handleClickOutside);
//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   const handleEmojiOverLayClick = () => {
//     setShowEmojiOverLay(!showEmojiOverLay);
//   };
//   return (
//     <div id="customOverLay">
//       <div id="customOverLayInner">
//         <div ref={overLayRef}>
//           <div id="customOverLayInnerButtons" onClick={handleEmojiOverLayClick}>
//             <div className="displayFlex smallIcon customIcon" id="done">
//               <div id="emoji"></div>
//             </div>
//             <div className="displayFlex smallIcon customIcon" id="close">
//               <span className="material-icons customIconStyle">close</span>
//             </div>
//           </div>
//           {showEmojiOverLay && (
//             <div className="custom-emoji-overlay">
//               <EmojiPicker />
//             </div>
//           )}
//         </div>
//       </div>
//       <div>
//         <div contentEditable>
//           This is the start of a new journey filled with twists and turns 😊
//         </div>
//       </div>
//     </div>
//   );
// };

// const UserBio = ({ tempTheme, colorKey }) => {
//   const [showPicker, setShowPicker] = useState(false);

//   const colorPickerRef = useRef(null);

//   const handleClickOutside = (e) => {
//     if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
//       setShowPicker(false);
//     }
//   };

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
//     <div>
//       <div className="displayFlex height50 alighnItemsCenter">
//         <div className="width100">User Bio:</div>
//         <div ref={colorPickerRef} id="colorPickerContainer">
//           <div className="color-picker-input" onClick={handleColorPickerClick}>
//             <span className="material-icons custom-icon-style">
//               text_fields
//             </span>
//             <div className="displayFlex smallIcon customIcon">
//               <span className="material-icons customIconStyle" id="pencil">
//                 edit
//               </span>
//             </div>
//           </div>
//           {showPicker && (
//             <div className="custom-overlay">
//               <OverLay />
//             </div>
//           )}
//         </div>
//       </div>
//       <div style={{ opacity: "0.4", padding: "25px", paddingTop: "10px" }}>
//         This is the start of a new journey filled with twists and turns 😊
//       </div>
//       <EventContext.Provider
//         value={{
//           showEmojiOverLay,
//         }}
//       >
//         <SlateInput onMessageSubmit={onMessageSubmit} />
//       </EventContext.Provider>
//     </div>
//   );
// };

// export default UserBio;
