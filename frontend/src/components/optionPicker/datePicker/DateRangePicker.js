import React, { useState, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateRangeContext from "./DateRangeContext";

function DateRangePicker() {
  const datePicker = useContext(DateRangeContext);

  const handleStartDateChange = (date) => {
    datePicker.setStartDate(date);
    console.log(date);
  };

  const handleEndDateChange = (date) => {
    datePicker.setEndDate(date);
    console.log(date);
  };

  return (
    <div className="timeFrameDiv">
      <div className="timeFrameInnerDivs">
        <div>from:</div>
        <DatePicker
          selected={datePicker.startDate}
          onChange={handleStartDateChange}
        />
      </div>
      <div className="timeFrameInnerDivs">
        <div>to:</div>
        <DatePicker
          selected={datePicker.endDate}
          onChange={handleEndDateChange}
        />
      </div>
    </div>
  );
}

export default DateRangePicker;
