export interface QualityDistributionData {
  ranges: string[]
  systems: Record<string, number[]>
}

export const qualityDistribution: QualityDistributionData = {
  ranges: ["0-200", "200-400", "400-600", "600-800", "800-1000"],
  systems: {
    Stanton: [20, 20, 20, 20, 20],
    Pyro: [20, 20, 20, 20, 20],
    Nyx: [20, 20, 20, 20, 20],
  },
}

// Helper function to fetch data (can be replaced with API call later)
export async function getQualityDistribution(): Promise<QualityDistributionData> {
  // In the future, this can be replaced with:
  // const res = await fetch("/api/quality-distribution")
  // return res.json()
  return qualityDistribution
}
