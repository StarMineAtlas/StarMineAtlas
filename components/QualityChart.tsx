"use client"

import { useRef, useEffect, useCallback } from "react"
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
const systemColors: Record<string, { 
  solid: string
  border: string
  hover: string
}> = {
  Stanton: {
    solid: "rgba(34, 211, 238, 0.85)",
    border: "rgba(34, 211, 238, 1)",
    hover: "rgba(34, 211, 238, 1)",
  },
  Pyro: {
    solid: "rgba(251, 191, 36, 0.85)",
    border: "rgba(251, 191, 36, 1)",
    hover: "rgba(251, 191, 36, 1)",
  },
  Nyx: {
    solid: "rgba(236, 72, 153, 0.85)",
    border: "rgba(236, 72, 153, 1)",
    hover: "rgba(236, 72, 153, 1)",
  },
}

export function QualityChart({ data }: QualityChartProps) {
  const chartRef = useRef<ChartJS<"bar">>(null)

  const createGradients = useCallback(() => {
    const chart = chartRef.current
    if (!chart) return null

    const ctx = chart.ctx
    const chartArea = chart.chartArea
    if (!chartArea) return null

    const gradients: Record<string, CanvasGradient> = {}
    
    // Stanton - cyan gradient
    const stantonGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    stantonGradient.addColorStop(0, "rgba(6, 182, 212, 0.4)")
    stantonGradient.addColorStop(0.5, "rgba(34, 211, 238, 0.7)")
    stantonGradient.addColorStop(1, "rgba(34, 211, 238, 0.95)")
    gradients["Stanton"] = stantonGradient

    // Pyro - amber/gold gradient
    const pyroGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    pyroGradient.addColorStop(0, "rgba(245, 158, 11, 0.4)")
    pyroGradient.addColorStop(0.5, "rgba(251, 191, 36, 0.7)")
    pyroGradient.addColorStop(1, "rgba(251, 191, 36, 0.95)")
    gradients["Pyro"] = pyroGradient

    // Nyx - magenta/pink gradient
    const nyxGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    nyxGradient.addColorStop(0, "rgba(219, 39, 119, 0.4)")
    nyxGradient.addColorStop(0.5, "rgba(236, 72, 153, 0.7)")
    nyxGradient.addColorStop(1, "rgba(236, 72, 153, 0.95)")
    gradients["Nyx"] = nyxGradient

    return gradients
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    const updateGradients = () => {
      const gradients = createGradients()
      if (!gradients) return

      chart.data.datasets.forEach((dataset, index) => {
        const systemName = Object.keys(data.systems)[index]
        if (gradients[systemName]) {
          dataset.backgroundColor = gradients[systemName]
        }
      })
      chart.update("none")
    }

    // Small delay to ensure chart is fully rendered
    const timer = setTimeout(updateGradients, 50)
    return () => clearTimeout(timer)
  }, [createGradients, data.systems])

  const chartData = {
    labels: data.ranges,
    datasets: Object.entries(data.systems).map(([system, values]) => ({
      label: system,
      data: values,
      backgroundColor: systemColors[system]?.solid || "rgba(100, 100, 100, 0.7)",
      borderColor: systemColors[system]?.border || "rgba(100, 100, 100, 1)",
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: systemColors[system]?.hover || "rgba(100, 100, 100, 1)",
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
        display: true,
        position: "top" as const,
        align: "center" as const,
        labels: {
          color: "rgba(203, 213, 225, 0.95)",
          font: {
            size: 13,
            weight: 500 as const,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "rectRounded" as const,
          boxWidth: 16,
          boxHeight: 16,
        },
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

      // Recreate gradients on resize
      const stantonGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      stantonGradient.addColorStop(0, "rgba(6, 182, 212, 0.4)")
      stantonGradient.addColorStop(0.5, "rgba(34, 211, 238, 0.7)")
      stantonGradient.addColorStop(1, "rgba(34, 211, 238, 0.95)")

      const pyroGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      pyroGradient.addColorStop(0, "rgba(245, 158, 11, 0.4)")
      pyroGradient.addColorStop(0.5, "rgba(251, 191, 36, 0.7)")
      pyroGradient.addColorStop(1, "rgba(251, 191, 36, 0.95)")

      const nyxGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      nyxGradient.addColorStop(0, "rgba(219, 39, 119, 0.4)")
      nyxGradient.addColorStop(0.5, "rgba(236, 72, 153, 0.7)")
      nyxGradient.addColorStop(1, "rgba(236, 72, 153, 0.95)")

      const gradientMap: Record<string, CanvasGradient> = {
        Stanton: stantonGradient,
        Pyro: pyroGradient,
        Nyx: nyxGradient,
      }

      chart.data.datasets.forEach((dataset) => {
        if (dataset.label && gradientMap[dataset.label]) {
          dataset.backgroundColor = gradientMap[dataset.label]
        }
      })
    },
  }

  return (
    <div className="relative">
      {/* Subtle glow effect behind the chart */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-pink-500/5 rounded-lg pointer-events-none" />
      
      {/* Chart container */}
      <div className="relative h-[450px] w-full p-4">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  )
}
