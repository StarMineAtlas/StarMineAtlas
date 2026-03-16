"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { QualityDistributionData } from "@/data/qualityDistribution"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface QualityChartProps {
  data: QualityDistributionData
}

const systemColors: Record<string, { bg: string; border: string }> = {
  Stanton: {
    bg: "rgba(59, 130, 246, 0.7)",
    border: "rgba(59, 130, 246, 1)",
  },
  Pyro: {
    bg: "rgba(249, 115, 22, 0.7)",
    border: "rgba(249, 115, 22, 1)",
  },
  Nyx: {
    bg: "rgba(168, 85, 247, 0.7)",
    border: "rgba(168, 85, 247, 1)",
  },
}

export function QualityChart({ data }: QualityChartProps) {
  const chartData = {
    labels: data.ranges,
    datasets: Object.entries(data.systems).map(([system, values]) => ({
      label: system,
      data: values,
      backgroundColor: systemColors[system]?.bg || "rgba(100, 100, 100, 0.7)",
      borderColor: systemColors[system]?.border || "rgba(100, 100, 100, 1)",
      borderWidth: 1,
      borderRadius: 4,
    })),
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(226, 232, 240, 0.9)",
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "rgba(226, 232, 240, 1)",
        bodyColor: "rgba(226, 232, 240, 0.9)",
        borderColor: "rgba(34, 211, 238, 0.3)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items: any[]) => {
            if (items.length > 0) {
              return items[0].dataset.label
            }
            return ""
          },
          label: (item: any) => {
            return [
              `Range: ${item.label}`,
              `Value: ${item.raw}%`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(100, 116, 139, 0.2)",
        },
        ticks: {
          color: "rgba(148, 163, 184, 0.9)",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(100, 116, 139, 0.2)",
        },
        ticks: {
          color: "rgba(148, 163, 184, 0.9)",
          font: {
            size: 11,
          },
          callback: (value: any) => `${value}%`,
        },
        beginAtZero: true,
        max: 100,
      },
    },
  }

  return (
    <div className="h-[400px] w-full">
      <Bar data={chartData} options={options} />
    </div>
  )
}
