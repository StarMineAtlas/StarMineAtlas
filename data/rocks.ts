import type { Mineral } from "./minerals"

export interface Rock {
  name: string
  primary: Mineral
  secondary: Mineral[]
  inert: boolean
}

export const rocks: Rock[] = [
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
