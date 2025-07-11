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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BasicChartProps {
  title: string;
  yData: number[];
  xData: (string | number)[];
  xLabel: string;
  yLabel: string;
  description?: string;
}

export default function BasicChart({
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
        borderColor: "#2563eb", // blue-600
        backgroundColor: "rgba(59, 130, 246, 0.1)", // blue-500 with opacity
        borderWidth: 3,
        pointBackgroundColor: "#93c5fd", // blue-300
        pointBorderColor: "#2563eb", // blue-600
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.2,
        fill: true,
      },
    ],
  };

  const options = {
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
          size: 16,
          weight: "bold" as const,
          family: "'Inter', sans-serif",
        },
        color: "#1f2937", // gray-800
        padding: 20,
      },
      tooltip: {
        backgroundColor: "rgba(30, 64, 175, 0.8)", // blue-800 with opacity
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
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
          },
        },
        beginAtZero: true,
        grid: {
          color: "#e5e7eb", // gray-200
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
          color: "#6b7280", // gray-500
        },
      },
      x: {
        title: {
          display: true,
          text: xLabel,
          font: {
            family: "'Inter', sans-serif",
            size: 14,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
          color: "#6b7280", // gray-500
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <Line data={data} options={options} />
      {description && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          {description}
        </div>
      )}
    </div>
  );
}
