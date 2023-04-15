import React from "react";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Chart.js Bar Chart",
    },
  },
};

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

function eachFloor(myCount: string) {
  return parseInt(myCount);
}

function groupDataByDay(data: MyData[]) {
  const groups: { [key: string]: number } = {};

  data.forEach((datum) => {
    const date = new Date(datum.CreationDate);
    const day = date.toDateString();
    // const count = parseInt(datum.Count);
    console.log(datum.Name);
    const count = eachFloor(datum.Count);

    if (!groups[day]) {
      groups[day] = 0;
    }

    groups[day] += count;
  });

  const labels = Object.keys(groups);
  const counts = Object.values(groups);

  return { labels, counts };
}

interface MyChartProps {
  data: MyData[];
}

function handleDownload() {
  const chartElement = document.getElementById("myChart") as HTMLCanvasElement; // replace 'my-chart' with the ID of your chart canvas element
  html2canvas(chartElement).then((canvas) => {
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

export function MyChart({ data }: MyChartProps) {
  const { labels, counts } = groupDataByDay(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Counts by Day",
        data: counts,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div>
      <Bar data={chartData} options={options} id="myChart" />
      <button onClick={handleDownload}>Download Chart</button>
    </div>
  );
}
