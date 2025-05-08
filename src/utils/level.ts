import { GameMode, LevelData, LevelDifficulty, LevelEntry } from "../types";
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

  const countByColors = new Map();
  const max = cols * rows;
  while (queue.length > 0) {
    const [r, c] = queue.pop()!;
    let color = board[r][c];
    const currColorCount = countByColors.get(color) ?? 0;
    DIRECTIONS.forEach(([dx, dy]) => {
      const nr = r + dx;
      const nc = c + dy;

      if (!isValid(nr, nc)) return;

      if (
        currColorCount < max * 0.6 &&
        board[nr][nc] === null &&
        Math.random() < spreadChance
      ) {
        board[nr][nc] = color;
        countByColors.set(color, (countByColors.get(color) || 0) + 1);
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

export function findNextLevel(id: string, levels: LevelEntry[]) {

  if (!id || !levels?.length) return undefined;

  const currentIndex = levels.findIndex((lvl) => lvl.id === id);
  if (currentIndex === -1) return undefined;

  const nextIndex = currentIndex + 1;
  if (nextIndex >= levels.length) return undefined;

  const nextLevel = levels[nextIndex];
  if (!nextLevel) return undefined;

  const nextLevelData = {
    mode: GameMode.Play,
    levelKey: nextLevel.id,
    levelData: nextLevel.levelData,
  };

  return nextLevelData;
}
