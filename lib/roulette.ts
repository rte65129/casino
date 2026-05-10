export const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

export function getColor(num: number): 'red' | 'black' | 'green' {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
}

export function getParity(num: number): 'even' | 'odd' | 'none' {
  if (num === 0) return 'none';
  return num % 2 === 0 ? 'even' : 'odd';
}

export function getPayoutMultiplier(betType: string): number {
  switch (betType) {
    case 'number': return 35;
    case 'color': return 1;
    case 'parity': return 1;
    case 'dozen': return 2;
    case 'half': return 1;
    default: return 0;
  }
}

export function checkWin(result: number, betType: string, betValue: string): boolean {
  const color = getColor(result);
  const parity = getParity(result);
  const dozen = result === 0 ? 0 : Math.ceil(result / 12); // 1,2,3
  const column = result === 0 ? 0 : (result % 3) + 1;      // 1,2,3

  switch (betType) {
    case 'number': return result === parseInt(betValue);
    case 'color': return color === betValue;
    case 'parity': return parity === betValue;
    case 'dozen': return dozen === parseInt(betValue);
    case 'half':
      if (betValue === '1-18') return result >= 1 && result <= 18;
      if (betValue === '19-36') return result >= 19 && result <= 36;
      return false;
    default: return false;
  }
}