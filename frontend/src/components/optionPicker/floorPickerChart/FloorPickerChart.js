import React, { useContext } from "react";
import FloorContextChart from "./FloorContextChart";

function FloorPickerChart() {
  const floorStateChart = useContext(FloorContextChart);

  const handleFloorSelect = (floor) => {
    floorStateChart.setSelectedFloorChart(floor);
    floorStateChart.setIsExpandedChart(false);
  };

  const handleButtonClick = (floor) => {
    handleFloorSelect(floor);
    floorStateChart.handleSettings({
      Type: "floor",
      Level: floor,
      Name: null,
    });
  };

  return (
    <div>
      <button
        onClick={() =>
          floorStateChart.setIsExpandedChart(!floorStateChart.isExpandedChart)
        }
      >
        By Floor
      </button>
      {floorStateChart.isExpandedChart && (
        <div>
          {["L1", "L2", "L3", "L4"].map((floor) => (
            <button
              key={floor}
              onClick={() => handleButtonClick(floor)}
              disabled={floor === floorStateChart.selectedFloorChart}
            >
              {floor}
            </button>
          ))}
        </div>
      )}
      {floorStateChart.selectedFloorChart > 0 ? (
        <span>Selected floor: {floorStateChart.selectedFloorChart}</span>
      ) : null}
    </div>
  );
}

export default FloorPickerChart;
