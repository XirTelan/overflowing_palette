import {
  EndlessMehanics,
  GameMode,
  LevelData,
  LevelDifficulty,
  LevelEntry,
  Portal,
  Position,
  TimedCell,
} from "../types";
import { DIRECTIONS, RATES } from "./constants";

const MAX_ATTEMPTS = 20;
const BLOCK_RATEBYDIFFICULTY = [0.03, 0.05, 0.1, 0.2];
const PORTALS_RATEBYDIFFICULTY = [1, 2, 3, 4];

const isValid = (
  nextRow: number,
  nextCol: number,
  rows: number,
  cols: number
) => {
  return nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
};

export function generateBoard(
  rows: number,
  cols: number,
  numColors: number,
  difficulty: LevelDifficulty,
  useBlocked = false
): number[][] {
  const board = Array.from({ length: rows }, () => Array(cols).fill(null));
  const spreadChance = RATES[difficulty];
  const totalCells = rows * cols;

  const allCells: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      allCells.push([r, c]);
    }
  }
  Phaser.Utils.Array.Shuffle(allCells);

  const seedPositions = allCells.slice(0, numColors);
  seedPositions.forEach(([r, c], index) => {
    board[r][c] = index;
  });

  spreadColors(board, seedPositions, rows, cols, spreadChance);

  fillEmptyCells(board, rows, cols, numColors);

  if (useBlocked) {
    applyBlockedCells(board, allCells, difficulty, totalCells);
  }

  return board;
}

function spreadColors(
  board: any[][],
  seedPositions: [number, number][],
  rows: number,
  cols: number,
  spreadChance: number
) {
  const queue = [...seedPositions];
  const colorCounts = new Map<number, number>();
  const max = rows * cols;

  while (queue.length > 0) {
    const [r, c] = queue.pop()!;
    const color = board[r][c];
    const count = colorCounts.get(color) ?? 0;

    for (const [dx, dy] of DIRECTIONS) {
      const nr = r + dx;
      const nc = c + dy;

      if (
        isValid(nr, nc, rows, cols) &&
        board[nr][nc] === null &&
        count < max * 0.6 &&
        Math.random() < spreadChance
      ) {
        board[nr][nc] = color;
        colorCounts.set(color, count + 1);
        queue.push([nr, nc]);
      }
    }
  }
}

function fillEmptyCells(
  board: any[][],
  rows: number,
  cols: number,
  numColors: number
) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === null) {
        board[r][c] = Math.floor(Math.random() * numColors);
      }
    }
  }
}

function applyBlockedCells(
  board: any[][],
  availableCells: [number, number][],
  difficulty: LevelDifficulty,
  totalCells: number
) {
  const blockCount = Math.floor(
    totalCells * BLOCK_RATEBYDIFFICULTY[difficulty]
  );

  Phaser.Utils.Array.Shuffle(availableCells);
  for (let i = 0; i < blockCount; i++) {
    const [r, c] = availableCells[i];
    board[r][c] = -1;
  }
}

export function generateLevel(
  rows: number,
  cols: number,
  numColors: number,
  difficulty: LevelDifficulty,
  mechanics?: EndlessMehanics
): LevelData {
  const usedCells = new Set<string>();
  const board = generateBoard(
    rows,
    cols,
    numColors,
    difficulty,
    mechanics?.blocked
  );
  return {
    board,
    targetColor: Phaser.Math.Between(0, numColors - 1),
    turns: 0,
    portals: mechanics?.portals
      ? generatePortals(rows, cols, difficulty, board, usedCells)
      : undefined,
    timed: mechanics?.timers
      ? generateTimers(rows, cols, difficulty, board, numColors, usedCells)
      : undefined,
  };
}

function getRandomPosition(rows: number, cols: number): Position {
  return [Phaser.Math.Between(0, rows - 1), Phaser.Math.Between(0, cols - 1)];
}

function positionToString([row, col]: Position): string {
  return `${row}-${col}`;
}

function getUniqueRandomPosition(
  rows: number,
  cols: number,
  board: number[][],
  usedCells: Set<string>
): Position | null {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const pos = getRandomPosition(rows, cols);
    const key = positionToString(pos);
    if (usedCells.has(key) || board[pos[0]][pos[1]] === -1) continue;
    usedCells.add(key);
    return pos;
  }

  return null;
}

function generatePortals(
  rows: number,
  cols: number,
  difficulty: LevelDifficulty,
  board: number[][],
  usedCells: Set<string>
): Portal[] {
  const totalCells = rows * cols;
  const maxPortals = PORTALS_RATEBYDIFFICULTY[difficulty];
  const portalCount = Math.min(Math.floor(totalCells / 4), maxPortals);

  const portals: Portal[] = [];

  while (portals.length < portalCount) {
    const pos1 = getUniqueRandomPosition(rows, cols, board, usedCells);
    if (!pos1) break;

    usedCells.add(positionToString(pos1));
    const pos2 = getUniqueRandomPosition(rows, cols, board, usedCells);
    if (!pos2) break;

    portals.push({ pair: [pos1, pos2] });
  }

  return portals;
}

function generateTimers(
  rows: number,
  cols: number,
  difficulty: LevelDifficulty,
  board: number[][],
  numColors: number,
  usedCells: Set<string>
): TimedCell[] {
  const totalCells = rows * cols;
  const maxTimers = [1, 2, 4, 6][difficulty];
  const timerCount = Math.min(Math.floor(totalCells / 5), maxTimers);

  const timers: TimedCell[] = [];

  while (timers.length < timerCount) {
    const pos = getUniqueRandomPosition(rows, cols, board, usedCells);
    if (!pos) break;

    timers.push({
      pos,
      color: Phaser.Math.Between(0, numColors - 1),
      turns: Phaser.Math.Between(1, 6),
    });
  }

  return timers;
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

export function parseLevelString(data: string) {
  try {
    const levelData = JSON.parse(atob(data));
    if (!("turns" in levelData) || !("board" in levelData)) return;
    return levelData;
  } catch (error) {
    console.warn("Not correct string", error);
  }
}

/**
 * Groups levels by folder and category.
 */
export function groupLevels(
  levels: LevelEntry[]
): Map<string, Map<string, LevelEntry[]>> {
  const grouped = new Map<string, Map<string, LevelEntry[]>>();

  for (const { folderName, categoryName } of levels) {
    if (!grouped.has(folderName)) {
      grouped.set(folderName, new Map());
    }
    const categoryMap = grouped.get(folderName)!;
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
  }

  levels.forEach((level) => {
    grouped.get(level.folderName)!.get(level.categoryName)!.push(level);
  });

  return grouped;
}

/**
 * Counts how many levels are cleared in a given list.
 */
export function countCleared(
  levels: LevelEntry[],
  clearedLevels: Map<string, any>
): number {
  return levels.filter((lvl) => clearedLevels.has(lvl.id)).length;
}

/**
 * Returns both total and cleared level stats.
 */
export function countClearedStats(
  levels: LevelEntry[],
  clearedLevels: Map<string, any>
) {
  return {
    cleared: countCleared(levels, clearedLevels),
    total: levels.length,
  };
}
