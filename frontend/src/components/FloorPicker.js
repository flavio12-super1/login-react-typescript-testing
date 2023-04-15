import React, { useContext } from "react";
import FloorContext from "./FloorContext";

function FloorPicker() {
  const floorState = useContext(FloorContext);

  const handleFloorSelect = (floor) => {
    floorState.setSelectedFloor(floor);
    floorState.setIsExpanded(false);
  };

  return (
    <div>
      <button onClick={() => floorState.setIsExpanded(!floorState.isExpanded)}>
        {floorState.isExpanded ? "Collapse" : "Expand"}
      </button>
      {floorState.isExpanded && (
        <div>
          {[1, 2, 3, 4].map((floor) => (
            <button
              key={floor}
              onClick={() => handleFloorSelect(floor)}
              disabled={floor === floorState.selectedFloor}
            >
              {floor}
            </button>
          ))}
        </div>
      )}
      <p>Selected floor: {floorState.selectedFloor}</p>
    </div>
  );
}

export default FloorPicker;
