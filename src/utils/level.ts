import { LevelData, LevelDifficulty } from "../types";
import { DIRECTIONS, RATES } from "./constants";

export function generateBoard(
  rows: number,
  cols: number,
  numColors: number,
  difficulty: LevelDifficulty
) {
  let board = Array.from({ length: rows }, () => Array(cols).fill(null));

  let spreadChance = RATES[difficulty];

  let availableCells: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      availableCells.push([r, c]);
    }
  }

  Phaser.Utils.Array.Shuffle(availableCells);

  let colorPositions = availableCells.slice(0, numColors);

  colorPositions.forEach(([r, c], index) => {
    board[r][c] = index;
  });

  let queue = [...colorPositions];

  const isValid = (nextRow: number, nextCol: number) => {
    return nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
  };

  while (queue.length > 0) {
    const [r, c] = queue.pop()!;
    let color = board[r][c];

    DIRECTIONS.forEach(([dx, dy]) => {
      const nr = r + dx;
      const nc = c + dy;

      if (!isValid(nr, nc)) return;

      if (board[nr][nc] === null && Math.random() < spreadChance) {
        board[nr][nc] = color;
        queue.push([nr, nc]);
      }
    });
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === null) {
        board[r][c] = Math.floor(Math.random() * numColors);
      }
    }
  }

  return board;
}

export function generateLevel(
  rows: number,
  cols: number,
  numColors: number,
  difficulty: LevelDifficulty
): LevelData {
  return {
    board: generateBoard(rows, cols, numColors, difficulty),
    targetColor: Math.floor(Math.random() * numColors),
    turns: 0,
  };
}
