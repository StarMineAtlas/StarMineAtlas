import type { System } from "./systems"

export const bodies: Record<System, string[]> = {
  Stanton: [
    "Hurston",
    "Aberdeen",
    "Arial",
    "Magda",
    "Ita",
    "MicroTech",
    "Calliope",
    "Clio",
    "Euterpe",
  ],
  Nyx: ["Delamar", "Nyx Asteroid Belt"],
  Pyro: [
    "Pyro I",
    "Pyro II",
    "Pyro III",
    "Pyro IV",
    "Pyro V",
    "Pyro VI",
    "Pyro Asteroid Belt",
  ],
}

export const allBodies = Object.values(bodies).flat()
