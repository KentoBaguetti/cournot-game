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

// caluculates the sum of the quantities in the array
const calculateQuantitySum = (quantities: number[]): number => {
  let qSum = 0;
  for (const q of quantities) {
    qSum += q;
  }
  return qSum;
};

const priceFunction = (x: number, quantities: number[]): number => {
  const qSum = calculateQuantitySum(quantities);
  return x - qSum;
};

const costFunction = (y: number, z: number, quantities: number[]): number => {
  const qSum = calculateQuantitySum(quantities);
  return y + z * qSum;
};

// for a firm given that their quantity is the variable "quantity"
// the array "quantities" contaisn the quantities of all the firms including the firm calling the function
const profitFunction = (
  x: number,
  y: number,
  z: number,
  quantity: number,
  quantities: number[]
): number => {
  const price = priceFunction(x, quantities);
  const cost = costFunction(y, z, quantities);
  return quantity * price - quantity * cost;
};

// the "quantities" array should not contain the quantity of the firm calling the function
// calculates q_n, where q_n is the quantity of the firm calling the function
// this function uses the derivative of the profit function with respect to q_n and sets it to 0, then solves for q_n
const maxProfitFunction = (
  x: number,
  y: number,
  z: number,
  quantities: number[]
): number => {
  const qSum = calculateQuantitySum(quantities);
  return (y + qSum - x) / (2 * z - 2);
};

const calculateMaxMonopolyQuantity = (
  x: number,
  y: number,
  z: number
): number => {
  return (y - x) / (2 * z - 2);
};

export {
  calculateMarketPrice,
  priceFunction,
  costFunction,
  profitFunction,
  maxProfitFunction,
  calculateQuantitySum,
  calculateMaxMonopolyQuantity,
};
