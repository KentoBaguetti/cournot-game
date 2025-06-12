// P(Q) = a - b*Q where Q = summation of Q1, Q2, ..., Qn
const calculateMarketPrice = (
  a: number,
  b: number,
  firmQuantities: number[]
): number => {
  let quantitiesSum: number = 0;
  for (let q of firmQuantities) {
    quantitiesSum += q;
  }

  const res = a - b * quantitiesSum;
  return Math.max(0, res); // so we dont have a negative pruice
};

const calculateProfit = (revenue: number, cost: number): number => {
  return revenue - cost;
};

const costFunction = () => {};

export { calculateMarketPrice, calculateProfit };
