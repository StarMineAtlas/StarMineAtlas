import type { Mineral } from "./minerals"
import type { System } from "./systems"
import { systems } from "./systems"
import { bodies } from "./bodies"

export interface Rock {
  name: string
  primary: Mineral
  secondary: Mineral[]
  inert: boolean
  system: System
  body: string
  quality: number
}

// Quality ranges per system
const qualityRanges: Record<System, [number, number]> = {
  Stanton: [100, 400],
  Nyx: [300, 700],
  Pyro: [600, 1000],
}

// Seeded random for consistent generation
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

// Base rock definitions
const baseRocks: Omit<Rock, "system" | "body" | "quality">[] = [
  {
    name: "Quantanium Rock",
    primary: "Quantanium",
    secondary: ["Copper", "Quartz"],
    inert: true,
  },
  {
    name: "Bexalite Rock",
    primary: "Bexalite",
    secondary: ["Gold"],
    inert: true,
  },
  {
    name: "Taranite Rock",
    primary: "Taranite",
    secondary: ["Titanium", "Iron"],
    inert: true,
  },
  {
    name: "Laranite Rock",
    primary: "Laranite",
    secondary: ["Beryl"],
    inert: true,
  },
  {
    name: "Agricium Rock",
    primary: "Agricium",
    secondary: ["Aluminum", "Quartz"],
    inert: true,
  },
  {
    name: "Hephaestanite Rock",
    primary: "Hephaestanite",
    secondary: ["Tungsten"],
    inert: true,
  },
  {
    name: "Borase Rock",
    primary: "Borase",
    secondary: ["Copper", "Iron"],
    inert: true,
  },
  {
    name: "Titanium Rock",
    primary: "Titanium",
    secondary: ["Aluminum"],
    inert: true,
  },
  {
    name: "Tungsten Rock",
    primary: "Tungsten",
    secondary: ["Iron", "Corundum"],
    inert: true,
  },
  {
    name: "Diamond Rock",
    primary: "Diamond",
    secondary: ["Quartz"],
    inert: true,
  },
  {
    name: "Gold Rock",
    primary: "Gold",
    secondary: ["Copper", "Quartz"],
    inert: true,
  },
  {
    name: "Copper Rock",
    primary: "Copper",
    secondary: ["Iron"],
    inert: true,
  },
  {
    name: "Beryl Rock",
    primary: "Beryl",
    secondary: ["Quartz", "Corundum"],
    inert: true,
  },
  {
    name: "Corundum Rock",
    primary: "Corundum",
    secondary: ["Beryl"],
    inert: true,
  },
  {
    name: "Quartz Rock",
    primary: "Quartz",
    secondary: [],
    inert: true,
  },
  {
    name: "Iron Rock",
    primary: "Iron",
    secondary: [],
    inert: true,
  },
  {
    name: "Aluminum Rock",
    primary: "Aluminum",
    secondary: ["Iron"],
    inert: true,
  },
  {
    name: "Hadanite Rock",
    primary: "Hadanite",
    secondary: ["Dolivine"],
    inert: true,
  },
  {
    name: "Aphorite Rock",
    primary: "Aphorite",
    secondary: ["Hadanite", "Dolivine"],
    inert: true,
  },
  {
    name: "Dolivine Rock",
    primary: "Dolivine",
    secondary: ["Aphorite"],
    inert: true,
  },
]

// Generate rocks for all systems
function generateRocks(): Rock[] {
  const generatedRocks: Rock[] = []
  let seedCounter = 42

  for (const baseRock of baseRocks) {
    for (const system of systems) {
      const random = seededRandom(seedCounter++)
      const [minQuality, maxQuality] = qualityRanges[system]
      const systemBodies = bodies[system]

      const rock: Rock = {
        ...baseRock,
        system,
        body: systemBodies[Math.floor(random() * systemBodies.length)],
        quality: Math.floor(random() * (maxQuality - minQuality + 1)) + minQuality,
      }

      generatedRocks.push(rock)
    }
  }

  return generatedRocks
}

export const rocks: Rock[] = generateRocks()
