import React from "react";
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

function groupDataByDay(data: MyData[]) {
  const groups: { [key: string]: number } = {};

  data.forEach((datum) => {
    const date = new Date(datum.CreationDate);
    const day = date.toDateString();
    const count = parseInt(datum.Count);

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

  return <Bar data={chartData} options={options} />;
}
