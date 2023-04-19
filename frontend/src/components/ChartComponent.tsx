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

function eachFloor(myCount: string) {
  return parseInt(myCount);
}

// function groupDataByDay(data: MyData[], settings: MySettings) {
//   const groups: { [key: string]: number } = {};

//   const filteredData = data.filter((datum) => {
//     const date = new Date(datum.CreationDate);
//     const dateString = date.toLocaleDateString();
//     const startDateString = settings.Start?.toLocaleDateString();
//     const endDateString = settings.End?.toLocaleDateString();
//     return (
//       (!settings.Start || dateString >= startDateString) &&
//       (!settings.End || dateString <= endDateString)
//     );
//   });

//   filteredData.forEach((datum) => {
//     const date = new Date(datum.CreationDate);
//     const day = date.toDateString();
//     console.log(datum.Level);
//     let count = 0;
//     if (settings.Type == "all") {
//       count = eachFloor(datum.Count);
//     } else if (settings.Type == "floor") {
//       if (datum.Level == settings.Level) {
//         count = eachFloor(datum.Count);
//       }
//     } else if (settings.Type == "room") {
//       if (datum.Name == settings.Name) {
//         count = eachFloor(datum.Count);
//       }
//     }

//     if (!groups[day]) {
//       groups[day] = 0;
//     }

//     groups[day] += count;
//   });

//   const labels = Object.keys(groups);
//   const counts = Object.values(groups);

//   return { labels, counts };
// }
function groupDataByDay(data: MyData[], settings: MySettings) {
  const groups: { [key: string]: number } = {};

  const start = settings.Start?.getTime() || 0;
  const end = settings.End?.getTime() || new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds
  const days = [];
  for (let time = start; time <= end; time += oneDay) {
    days.push(new Date(time).toDateString());
  }

  const filteredData = data.filter((datum) => {
    const date = new Date(datum.CreationDate);
    return date.getTime() >= start && date.getTime() <= end;
  });

  filteredData.forEach((datum) => {
    const date = new Date(datum.CreationDate);
    const day = date.toDateString();
    let count = 0;
    if (settings.Type == "all") {
      count = eachFloor(datum.Count);
    } else if (settings.Type == "floor") {
      if (datum.Level == settings.Level) {
        count = eachFloor(datum.Count);
      }
    } else if (settings.Type == "room") {
      if (datum.Name == settings.Name) {
        count = eachFloor(datum.Count);
      }
    }

    if (!groups[day]) {
      groups[day] = 0;
    }

    groups[day] += count;
  });

  const labels = days;
  const counts = days.map((day) => groups[day] || 0);

  return { labels, counts };
}

interface MyChartProps {
  data: MyData[];
  settings: MySettings;
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

export function MyChart({ data, settings }: MyChartProps) {
  const { labels, counts } = groupDataByDay(data, settings);

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
