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

export interface MineralToSell extends Mineral {
    quantity: number;
    yield: number;
    quality: number;
}
