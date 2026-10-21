import { AutoTypeStep, KeyboardLayoutDef, KeyboardLayoutId } from '../types/ir';

/**
 * Standard YouTube TV Grid Layout (A-F, G-L, ...)
 */
export const YOUTUBE_GRID_LAYOUT: KeyboardLayoutDef = {
  id: 'youtube_grid',
  name: 'YouTube TV (Grid A-Z 6 Kolom)',
  description: 'Tata letak bawaan aplikasi YouTube TV & Smart TV Media',
  grid: [
    ['A', 'B', 'C', 'D', 'E', 'F'],
    ['G', 'H', 'I', 'J', 'K', 'L'],
    ['M', 'N', 'O', 'P', 'Q', 'R'],
    ['S', 'T', 'U', 'V', 'W', 'X'],
    ['Y', 'Z', '1', '2', '3', '4'],
    ['5', '6', '7', '8', '9', '0'],
    ['CLR', 'SPACE', 'SPACE', 'SPACE', 'BKSP', 'SEARCH']
  ],
  spacePos: { row: 6, col: 1 },
  backspacePos: { row: 6, col: 4 },
  enterPos: { row: 6, col: 5 }
};

/**
 * Standard Browser QWERTY Layout (digunakan di Samsung Tizen Browser, LG webOS Browser, & Android TV Gboard)
 */
export const BROWSER_QWERTY_LAYOUT: KeyboardLayoutDef = {
  id: 'browser_qwerty',
  name: 'TV Browser (Standar QWERTY)',
  description: 'Tata letak keyboard QWERTY browser TV, pencarian Google & URL',
  grid: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '-'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '/', '@'],
    ['RESET', 'SYM', 'SPACE', 'SPACE', 'SPACE', 'SPACE', 'BKSP', 'ENTER', 'ENTER', 'GO']
  ],
  spacePos: { row: 4, col: 2 },
  backspacePos: { row: 4, col: 6 },
  enterPos: { row: 4, col: 7 }
};

export const KEYBOARD_LAYOUTS: Record<KeyboardLayoutId, KeyboardLayoutDef> = {
  youtube_grid: YOUTUBE_GRID_LAYOUT,
  browser_qwerty: BROWSER_QWERTY_LAYOUT,
  alphabetical_grid: {
    id: 'alphabetical_grid',
    name: 'Grid Alphabet 5 Kolom',
    description: 'Tata letak 5 kolom A-E, F-J untuk beberapa model Android TV',
    grid: [
      ['A', 'B', 'C', 'D', 'E'],
      ['F', 'G', 'H', 'I', 'J'],
      ['K', 'L', 'M', 'N', 'O'],
      ['P', 'Q', 'R', 'S', 'T'],
      ['U', 'V', 'W', 'X', 'Y'],
      ['Z', '1', '2', '3', '4'],
      ['5', '6', '7', '8', '9'],
      ['0', 'SPACE', 'SPACE', 'BKSP', 'ENTER']
    ],
    spacePos: { row: 7, col: 1 },
    backspacePos: { row: 7, col: 3 },
    enterPos: { row: 7, col: 4 }
  }
};

/**
 * Mencari posisi { row, col } suatu karakter pada grid layout aktif
 */
export function findCharPosition(
  char: string,
  layout: KeyboardLayoutDef
): { row: number; col: number } | null {
  const upper = char.toUpperCase();

  if (upper === ' ') {
    return layout.spacePos;
  }
  if (upper === '⌫' || upper === 'BKSP' || upper === 'BACKSPACE') {
    return layout.backspacePos;
  }
  if (upper === '↵' || upper === 'ENTER' || upper === 'SEARCH' || upper === 'GO') {
    return layout.enterPos;
  }

  for (let r = 0; r < layout.grid.length; r++) {
    for (let c = 0; c < layout.grid[r].length; c++) {
      if (layout.grid[r][c] === upper) {
        return { row: r, col: c };
      }
    }
  }

  return null;
}

/**
 * Menghitung rute navigasi terpendek dari posisi asal ke posisi tujuan
 */
export function calculateNavMoves(
  from: { row: number; col: number },
  to: { row: number; col: number }
): ('up' | 'down' | 'left' | 'right' | 'ok')[] {
  const moves: ('up' | 'down' | 'left' | 'right' | 'ok')[] = [];

  const dy = to.row - from.row;
  const dx = to.col - from.col;

  // Gerak Vertikal
  if (dy > 0) {
    for (let i = 0; i < dy; i++) moves.push('down');
  } else if (dy < 0) {
    for (let i = 0; i < Math.abs(dy); i++) moves.push('up');
  }

  // Gerak Horizontal
  if (dx > 0) {
    for (let i = 0; i < dx; i++) moves.push('right');
  } else if (dx < 0) {
    for (let i = 0; i < Math.abs(dx); i++) moves.push('left');
  }

  // Konfirmasi / Tekan Karakter
  moves.push('ok');

  return moves;
}

/**
 * Membuat seluruh rangkaian langkah pengetikan otomatis (Auto-Type Plan)
 * untuk sebuah string kalimat / query pencarian.
 */
export function planAutoTypeSequence(
  text: string,
  layout: KeyboardLayoutDef,
  initialPos: { row: number; col: number } = { row: 0, col: 0 }
): { steps: AutoTypeStep[]; totalMoves: number } {
  const steps: AutoTypeStep[] = [];
  let currentPos = { ...initialPos };
  let totalMoves = 0;

  for (const char of text) {
    const targetPos = findCharPosition(char, layout);
    if (!targetPos) {
      // Karakter tidak ada di grid, lewati
      continue;
    }

    const moves = calculateNavMoves(currentPos, targetPos);
    totalMoves += moves.length;

    steps.push({
      char,
      moves,
      from: { ...currentPos },
      to: { ...targetPos }
    });

    currentPos = { ...targetPos };
  }

  return { steps, totalMoves };
}
