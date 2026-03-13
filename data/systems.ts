export const systems = ["Stanton", "Nyx", "Pyro"] as const

export type System = (typeof systems)[number]
