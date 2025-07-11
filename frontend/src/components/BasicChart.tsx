import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ChartOptions, TooltipItem } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BasicChartProps {
  styles?: string;
  title: string;
  yData: number[];
  xData: (string | number)[];
  xLabel: string;
  yLabel: string;
  description?: string;
}

export default function BasicChart({
  styles = "",
  title,
  yData,
  xData,
  xLabel,
  yLabel,
  description,
}: BasicChartProps) {
  const data = {
    labels: xData,
    datasets: [
      {
        data: yData,
        borderColor: "#1d4ed8", // blue-700
        backgroundColor: "rgba(37, 99, 235, 0.15)", // blue-600 with opacity
        borderWidth: 2.5,
        pointBackgroundColor: "#ffffff", // white
        pointBorderColor: "#1d4ed8", // blue-700
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#bfdbfe", // blue-200
        pointHoverBorderColor: "#1e40af", // blue-800
        pointHoverBorderWidth: 2,
        tension: 0.2, // slight curve for more modern look
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
          weight: "bold",
          family: "'Inter', sans-serif",
        },
        color: "#1e3a8a", // blue-900
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(30, 58, 138, 0.85)", // blue-900 with opacity
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (tooltipItem: TooltipItem<"line">) {
            return `${tooltipItem.parsed.y}`;
          },
        },
        borderColor: "rgba(219, 234, 254, 0.3)", // blue-100 with opacity
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: yLabel,
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: "bold",
          },
          color: "#1e40af", // blue-800
          padding: {
            bottom: 10,
          },
        },
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.7)", // slate-200 with opacity
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: "#64748b", // slate-500
          padding: 8,
        },
      },
      x: {
        title: {
          display: true,
          text: xLabel,
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: "bold",
          },
          color: "#1e40af", // blue-800
          padding: {
            top: 10,
          },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: "#64748b", // slate-500
          padding: 8,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        borderJoinStyle: "round",
      },
    },
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg mb-8 ${styles}`}>
      <Line data={data} options={options} />
      {description && (
        <div className="mt-4 text-sm text-slate-600 text-center">
          {description}
        </div>
      )}
    </div>
  );
}
