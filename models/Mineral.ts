export enum MineralType {
    FPS = "FPS",
    SHIP = "Ship",
}

export interface Mineral {
    name: string;
    secondary: string;
    type: MineralType;
    foundOneRock: boolean;
    radarValue: number;
}

