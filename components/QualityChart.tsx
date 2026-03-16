"use client"

import { useRef, useEffect, useState } from "react"
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

// Sci-fi themed colors for star systems with gradient stops
const systemColors: Record<string, { 
  start: string
  end: string
  border: string
  glow: string 
}> = {
  Stanton: {
    start: "rgba(34, 211, 238, 0.95)",
    end: "rgba(6, 182, 212, 0.6)",
    border: "rgba(34, 211, 238, 1)",
    glow: "rgba(34, 211, 238, 0.4)",
  },
  Pyro: {
    start: "rgba(251, 191, 36, 0.95)",
    end: "rgba(245, 158, 11, 0.6)",
    border: "rgba(251, 191, 36, 1)",
    glow: "rgba(251, 191, 36, 0.4)",
  },
  Nyx: {
    start: "rgba(236, 72, 153, 0.95)",
    end: "rgba(219, 39, 119, 0.6)",
    border: "rgba(236, 72, 153, 1)",
    glow: "rgba(236, 72, 153, 0.4)",
  },
}

function createGradient(ctx: CanvasRenderingContext2D, chartArea: { top: number; bottom: number }, colors: { start: string; end: string }) {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  gradient.addColorStop(0, colors.end)
  gradient.addColorStop(1, colors.start)
  return gradient
}

export function QualityChart({ data }: QualityChartProps) {
  const chartRef = useRef<ChartJS<"bar">>(null)
  const [gradients, setGradients] = useState<Record<string, CanvasGradient | string>>({})

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    const ctx = chart.ctx
    const chartArea = chart.chartArea
    if (!chartArea) return

    const newGradients: Record<string, CanvasGradient> = {}
    Object.entries(systemColors).forEach(([system, colors]) => {
      newGradients[system] = createGradient(ctx, chartArea, colors)
    })
    setGradients(newGradients)
  }, [])

  const chartData = {
    labels: data.ranges,
    datasets: Object.entries(data.systems).map(([system, values]) => ({
      label: system,
      data: values,
      backgroundColor: gradients[system] || systemColors[system]?.start || "rgba(100, 100, 100, 0.7)",
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
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(2, 6, 23, 0.95)",
        titleColor: "#22d3ee",
        titleFont: {
          size: 14,
          weight: 600 as const,
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
            weight: 500 as const,
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
            weight: 500 as const,
          },
          padding: 12,
          callback: (value: any) => `${value}%`,
          stepSize: 10,
        },
        beginAtZero: true,
        max: 50,
      },
    },
    onResize: (chart: ChartJS) => {
      const ctx = chart.ctx
      const chartArea = chart.chartArea
      if (!chartArea) return

      const newGradients: Record<string, CanvasGradient> = {}
      Object.entries(systemColors).forEach(([system, colors]) => {
        newGradients[system] = createGradient(ctx, chartArea, colors)
      })
      setGradients(newGradients)
    },
  }

  return (
    <div className="relative">
      {/* Centered legend at top */}
      <div className="flex justify-center gap-8 mb-6">
        {Object.entries(systemColors).map(([system, colors]) => (
          <div key={system} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ 
                background: `linear-gradient(to top, ${colors.end}, ${colors.start})`,
                border: `2px solid ${colors.border}`,
                boxShadow: `0 0 8px ${colors.glow}`,
              }}
            />
            <span className="text-sm text-slate-300 font-medium">{system}</span>
          </div>
        ))}
      </div>

      {/* Subtle glow effect behind the chart */}
      <div className="absolute inset-0 top-12 bg-gradient-to-b from-cyan-500/5 via-transparent to-pink-500/5 rounded-lg pointer-events-none" />
      
      {/* Chart container */}
      <div className="relative h-[450px] w-full p-4">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  )
}
