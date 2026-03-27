export interface Question {
  mathString: string;
  answer: number;
}

export function generateQuestion(): Question {
  const ops = ["-", "+", "*"];
  const operator = ops[Math.floor(Math.random() * ops.length)];
  const numA = Math.floor(Math.random() * 20) + 1;
  const numB = Math.floor(Math.random() * 20) + 1;

  let answer: number;

  switch (operator) {
    case "+":
      answer = numA + numB;
      break;
    case "-":
      answer = numA - numB;
      break;
    case "*":
      answer = numA * numB;
      break;
    default:
      answer = 0;
      break;
  }

  return {
    mathString: `${numA} ${operator} ${numB}`,
    answer: answer,
  };
}
