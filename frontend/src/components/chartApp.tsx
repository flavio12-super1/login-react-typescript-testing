import React from "react";
import { MyChart } from "./ChartComponent";

interface MyData {
  OBJECTID: string;
  GlobalID: string;
  GUID: string;
  Name: string;
  Level: string;
  Count: string;
  CreationDate: string;
  Creator: string;
  EditDate: string;
  Editor: string;
}
interface MySettings {
  Type: string;
  Level: string;
  Name: string;
  Start: Date;
  End: Date;
}

interface MyProps {
  data: MyData[];
  settings: MySettings;
}

function chartApp(props: MyProps) {
  const { data, settings } = props;

  return (
    <div>
      <MyChart data={data} settings={settings} />
    </div>
  );
}

export default chartApp;
