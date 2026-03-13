export const minerals = [
  "Quantanium",
  "Bexalite",
  "Taranite",
  "Laranite",
  "Agricium",
  "Hephaestanite",
  "Borase",
  "Titanium",
  "Tungsten",
  "Diamond",
  "Gold",
  "Copper",
  "Beryl",
  "Corundum",
  "Quartz",
  "Iron",
  "Aluminum",
  "Hadanite",
  "Aphorite",
  "Dolivine",
] as const

export type Mineral = (typeof minerals)[number]
