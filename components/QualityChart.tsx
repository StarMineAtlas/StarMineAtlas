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

// Sci-fi themed colors for star systems
// Stanton: Cool cyan/teal - representing a stable, corporate system
// Pyro: Warm amber/gold - representing the fiery, lawless system
// Nyx: Deep magenta/pink - representing the mysterious, shadowy system
const systemColors: Record<string, { bg: string; border: string; glow: string }> = {
  Stanton: {
    bg: "rgba(34, 211, 238, 0.75)",
    border: "rgba(34, 211, 238, 1)",
    glow: "rgba(34, 211, 238, 0.4)",
  },
  Pyro: {
    bg: "rgba(251, 191, 36, 0.75)",
    border: "rgba(251, 191, 36, 1)",
    glow: "rgba(251, 191, 36, 0.4)",
  },
  Nyx: {
    bg: "rgba(236, 72, 153, 0.75)",
    border: "rgba(236, 72, 153, 1)",
    glow: "rgba(236, 72, 153, 0.4)",
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
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: systemColors[system]?.border || "rgba(100, 100, 100, 1)",
      hoverBorderColor: "#ffffff",
      hoverBorderWidth: 2,
    })),
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          color: "rgba(226, 232, 240, 0.95)",
          font: {
            size: 13,
            weight: 500,
          },
          padding: 24,
          usePointStyle: true,
          pointStyle: "rectRounded",
          boxWidth: 16,
          boxHeight: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(2, 6, 23, 0.95)",
        titleColor: "#22d3ee",
        titleFont: {
          size: 14,
          weight: 600,
        },
        bodyColor: "rgba(226, 232, 240, 0.95)",
        bodyFont: {
          size: 13,
        },
        borderColor: "rgba(34, 211, 238, 0.4)",
        borderWidth: 1,
        padding: 16,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items: any[]) => {
            if (items.length > 0) {
              return `Quality Range: ${items[0].label}`
            }
            return ""
          },
          label: (item: any) => {
            return ` ${item.dataset.label}: ${item.raw}%`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(51, 65, 85, 0.5)",
          lineWidth: 1,
        },
        border: {
          color: "rgba(51, 65, 85, 0.8)",
        },
        ticks: {
          color: "rgba(148, 163, 184, 0.95)",
          font: {
            size: 12,
            weight: 500,
          },
          padding: 8,
        },
      },
      y: {
        grid: {
          color: "rgba(51, 65, 85, 0.4)",
          lineWidth: 1,
        },
        border: {
          color: "rgba(51, 65, 85, 0.8)",
        },
        ticks: {
          color: "rgba(148, 163, 184, 0.95)",
          font: {
            size: 12,
            weight: 500,
          },
          padding: 12,
          callback: (value: any) => `${value}%`,
          stepSize: 10,
        },
        beginAtZero: true,
        max: 50,
      },
    },
  }

  return (
    <div className="relative">
      {/* Subtle glow effect behind the chart */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-pink-500/5 rounded-lg pointer-events-none" />
      
      {/* Chart container */}
      <div className="relative h-[450px] w-full p-4">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* System color legend with glow indicators */}
      <div className="flex justify-center gap-8 mt-4 pb-2">
        {Object.entries(systemColors).map(([system, colors]) => (
          <div key={system} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: colors.border,
                boxShadow: `0 0 8px ${colors.glow}, 0 0 16px ${colors.glow}`,
              }}
            />
            <span className="text-sm text-slate-300 font-medium">{system}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
