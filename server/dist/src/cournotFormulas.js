const calculateMarketPrice = (initialValue, firmQuantities) => {
    let quantitiesSum = 0;
    for (let q of firmQuantities) {
        quantitiesSum += q;
    }
    return initialValue - quantitiesSum;
};
const calculateProfit = (revenue, cost) => {
    return revenue - cost;
};
export { calculateMarketPrice, calculateProfit };
