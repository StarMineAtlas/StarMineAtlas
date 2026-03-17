export interface RefineryMethod {
    id: number;
    name: string;
    code: string;
    rating_yield: number;
    rating_cost: number;
    rating_speed: number;
    date_added: number;
}

// add object with key to store translations for refinery ratings
export const RefineryRatingYield = {
    1: "refinery.yield.low",
    2: "refinery.yield.medium",
    3: "refinery.yield.high",
}

export const RefineryRatingCost = {
    1: "refinery.cost.low",
    2: "refinery.cost.medium",
    3: "refinery.cost.high",
}

export const RefineryRatingSpeed = {
    1: "refinery.speed.low",
    2: "refinery.speed.medium",
    3: "refinery.speed.high",
}