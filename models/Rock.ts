export interface Rock {
    name: string
    system: string
    body: string
    primary: string
    secondary: string[]
    isHidden?: boolean
    min: number
    max: number
    median: number
    average: number
}

export interface RockSecondaries {
    mineral: string
    min: number
    max: number
    median: number
}