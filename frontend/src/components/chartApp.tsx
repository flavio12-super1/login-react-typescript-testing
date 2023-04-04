import React from "react";
import { MyChart } from "./ChartComponent";

interface MyData {
  OBJECTID: string;
  GlobalID: string;
  GUID: string;
  Name: string;
  Count: string;
  CreationDate: string;
  Creator: string;
  EditDate: string;
  Editor: string;
}

interface MyProps {
  data: MyData[];
}

function chartApp(props: MyProps) {
  const { data } = props;

  return (
    <div>
      <MyChart data={data} />
    </div>
  );
}

export default chartApp;
