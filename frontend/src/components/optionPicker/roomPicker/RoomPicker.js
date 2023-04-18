import React, { useContext } from "react";
import RoomContext from "./RoomContext";

function RoomPicker() {
  const RoomState = useContext(RoomContext);

  const handleRoomSelect = (Room) => {
    RoomState.setSelectedRoom(Room);
    RoomState.setIsExpandedRoom(false);
  };

  return (
    <div>
      <button
        onClick={() => RoomState.setIsExpandedRoom(!RoomState.isExpandedRoom)}
      >
        By Room
      </button>
      {RoomState.isExpandedRoom && (
        <div>
          {[
            "157",
            "190",
            "260",
            "262",
            "264",
            "266",
            "268",
            "272",
            "274",
            "276",
            "S2-5",
            "360",
            "362",
            "368",
            "372",
            "374",
            "376",
            "380",
            "460",
            "464",
            "470",
            "474",
            "480",
            "480A",
            "487A",
            "489A",
          ].map((Room) => (
            <button
              key={Room}
              onClick={() => handleRoomSelect(Room)}
              disabled={Room === RoomState.selectedRoom}
            >
              {Room}
            </button>
          ))}
        </div>
      )}
      {RoomState.selectedRoom !== null ? (
        <span>Selected Room: {RoomState.selectedRoom}</span>
      ) : null}
    </div>
  );
}

export default RoomPicker;
