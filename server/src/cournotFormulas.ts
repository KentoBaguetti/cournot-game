const calculateMarketPrice = (initialValue: number, firmQuantities: number[]): number => {
    let quantitiesSum: number = 0;
    for (let q of firmQuantities) {
        quantitiesSum += q;
    }
    return initialValue - quantitiesSum;
}

const calculateProfit = (revenue: number, cost: number): number => {
    return revenue - cost;
}

export { calculateMarketPrice, calculateProfit };