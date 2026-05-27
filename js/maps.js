// ============================================================
//  MAP DATA - 20 progressive levels (difficulty: low → high)
// ============================================================
// Tile legend:
//   0 = EMPTY, 1 = BRICK, 2 = STEEL, 3 = GRASS,
//   4 = GLASS, 5 = RIVER.
//
// Easy levels: lots of brick near base, clear shooting lanes,
//   player-friendly cover, minimal glass.
// Hard levels: minimal base protection, extensive glass barriers,
//   open enemy approaches, grass near spawns.

const LEVEL_NAMES = [
  // Very Easy (1-3)
  '训练场', '砖墙堡垒', '安全走廊',
  // Easy (4-6)
  '草丛掩护', '河畔前线', '双塔防线',
  // Medium (7-10)
  '玻璃初现', '迷宫小径', '水晶庭院', '丛林深处',
  // Medium-Hard (11-13)
  '十字路口', '铁壁合围', '河湾峡谷',
  // Hard (14-16)
  '开阔地带', '玻璃要塞', '险境求生',
  // Very Hard (17-20)
  '钢铁迷宫', '死亡走廊', '孤军奋战', '最终决战',
];

function blankMap() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function fillRect(map, r1, c1, r2, c2, tile) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) map[r][c] = tile;
    }
  }
}

function fillCells(map, tile, cells) {
  for (const [r, c] of cells) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) map[r][c] = tile;
  }
}

function addBaseBricks(map) {
  fillRect(map, 18, 6, 18, 12, BRICK);
  map[19][6] = BRICK;
  map[19][12] = BRICK;
  map[19][9] = EMPTY;
  map[19][10] = EMPTY;
}

function done(map) {
  addBaseBricks(map);
  return map;
}

// ============================================================
//  VERY EASY — Levels 1-3
// ============================================================

function level1() {
  const m = blankMap();
  fillRect(m, 16, 4, 17, 5, BRICK);
  fillRect(m, 16, 14, 17, 15, BRICK);
  fillRect(m, 17, 6, 17, 13, BRICK);
  fillRect(m, 15, 7, 15, 12, BRICK);
  fillRect(m, 12, 1, 13, 3, BRICK);
  fillRect(m, 12, 16, 13, 18, BRICK);
  fillRect(m, 10, 8, 11, 11, BRICK);
  fillRect(m, 5, 4, 6, 5, BRICK);
  fillRect(m, 5, 14, 6, 15, BRICK);
  return done(m);
}

function level2() {
  const m = blankMap();
  fillRect(m, 15, 5, 16, 14, BRICK);
  fillRect(m, 17, 4, 17, 15, BRICK);
  m[16][9] = EMPTY; m[16][10] = EMPTY;
  m[15][9] = EMPTY; m[15][10] = EMPTY;
  fillRect(m, 9, 2, 10, 4, BRICK);
  fillRect(m, 9, 15, 10, 17, BRICK);
  fillRect(m, 10, 8, 10, 11, BRICK);
  fillRect(m, 4, 6, 4, 13, BRICK);
  fillRect(m, 3, 8, 3, 11, BRICK);
  return done(m);
}

function level3() {
  const m = blankMap();
  fillRect(m, 16, 4, 17, 14, BRICK);
  m[17][8] = EMPTY; m[17][9] = EMPTY; m[17][10] = EMPTY; m[17][11] = EMPTY;
  fillRect(m, 11, 3, 12, 7, BRICK);
  fillRect(m, 11, 12, 12, 16, BRICK);
  m[11][5] = EMPTY; m[11][14] = EMPTY;
  fillRect(m, 7, 1, 8, 3, BRICK);
  fillRect(m, 7, 16, 8, 18, BRICK);
  fillRect(m, 6, 8, 6, 11, BRICK);
  fillRect(m, 14, 6, 14, 7, GRASS);
  fillRect(m, 14, 12, 14, 13, GRASS);
  return done(m);
}

// ============================================================
//  EASY — Levels 4-6
// ============================================================

function level4() {
  const m = blankMap();
  fillRect(m, 16, 5, 17, 14, BRICK);
  m[17][8] = EMPTY; m[17][9] = EMPTY; m[17][10] = EMPTY; m[17][11] = EMPTY;
  fillRect(m, 14, 3, 15, 5, GRASS);
  fillRect(m, 14, 14, 15, 16, GRASS);
  fillRect(m, 10, 2, 11, 5, BRICK);
  fillRect(m, 10, 14, 11, 17, BRICK);
  fillRect(m, 9, 7, 9, 12, BRICK);
  fillRect(m, 4, 8, 5, 11, GRASS);
  fillRect(m, 3, 2, 3, 4, BRICK);
  fillRect(m, 3, 15, 3, 17, BRICK);
  return done(m);
}

function level5() {
  const m = blankMap();
  fillRect(m, 16, 5, 17, 14, BRICK);
  m[16][9] = EMPTY; m[16][10] = EMPTY;
  fillRect(m, 7, 0, 7, 6, RIVER);
  fillRect(m, 7, 13, 7, 19, RIVER);
  fillRect(m, 13, 8, 13, 11, RIVER);
  fillRect(m, 9, 2, 10, 4, BRICK);
  fillRect(m, 9, 15, 10, 17, BRICK);
  fillRect(m, 11, 5, 12, 6, BRICK);
  fillRect(m, 11, 13, 12, 14, BRICK);
  fillRect(m, 14, 7, 14, 12, GRASS);
  return done(m);
}

function level6() {
  const m = blankMap();
  fillRect(m, 16, 4, 17, 6, BRICK);
  fillRect(m, 16, 13, 17, 15, BRICK);
  fillRect(m, 15, 7, 15, 12, BRICK);
  fillRect(m, 10, 1, 12, 4, BRICK);
  fillRect(m, 10, 15, 12, 18, BRICK);
  m[11][4] = EMPTY; m[11][15] = EMPTY;
  fillRect(m, 8, 7, 9, 12, BRICK);
  m[8][9] = EMPTY; m[8][10] = EMPTY;
  fillRect(m, 3, 2, 3, 5, BRICK);
  fillRect(m, 3, 14, 3, 17, BRICK);
  fillRect(m, 4, 8, 4, 11, GRASS);
  return done(m);
}

// ============================================================
//  MEDIUM — Levels 7-10
// ============================================================

function level7() {
  const m = blankMap();
  fillRect(m, 16, 5, 17, 6, BRICK);
  fillRect(m, 16, 13, 17, 14, BRICK);
  fillRect(m, 15, 7, 15, 12, BRICK);
  fillRect(m, 11, 4, 12, 6, GLASS);
  fillRect(m, 11, 13, 12, 15, GLASS);
  fillRect(m, 8, 2, 9, 4, BRICK);
  fillRect(m, 8, 15, 9, 17, BRICK);
  fillRect(m, 7, 8, 7, 11, BRICK);
  fillRect(m, 5, 1, 6, 3, GRASS);
  fillRect(m, 5, 16, 6, 18, GRASS);
  return done(m);
}

function level8() {
  const m = blankMap();
  fillRect(m, 17, 4, 17, 15, BRICK);
  m[17][7] = EMPTY; m[17][8] = EMPTY; m[17][11] = EMPTY; m[17][12] = EMPTY;
  fillRect(m, 5, 2, 5, 9, BRICK);
  fillRect(m, 5, 10, 11, 10, BRICK);
  fillRect(m, 5, 11, 5, 17, BRICK);
  fillRect(m, 11, 1, 11, 9, BRICK);
  fillRect(m, 11, 11, 11, 18, BRICK);
  fillRect(m, 8, 4, 9, 5, GLASS);
  fillRect(m, 8, 14, 9, 15, GLASS);
  fillRect(m, 2, 7, 3, 12, GRASS);
  return done(m);
}

function level9() {
  const m = blankMap();
  fillRect(m, 17, 5, 17, 14, BRICK);
  m[17][8] = EMPTY; m[17][9] = EMPTY; m[17][10] = EMPTY; m[17][11] = EMPTY;
  fillRect(m, 7, 3, 8, 6, GLASS);
  fillRect(m, 7, 13, 8, 16, GLASS);
  fillRect(m, 12, 7, 13, 12, GLASS);
  fillRect(m, 4, 1, 5, 3, BRICK);
  fillRect(m, 4, 16, 5, 18, BRICK);
  fillRect(m, 10, 0, 10, 2, BRICK);
  fillRect(m, 10, 17, 10, 19, BRICK);
  fillRect(m, 14, 3, 15, 5, GRASS);
  fillRect(m, 14, 14, 15, 16, GRASS);
  return done(m);
}

function level10() {
  const m = blankMap();
  fillRect(m, 17, 5, 17, 14, BRICK);
  m[17][8] = EMPTY; m[17][9] = EMPTY; m[17][10] = EMPTY; m[17][11] = EMPTY;
  fillRect(m, 8, 0, 10, 4, GRASS);
  fillRect(m, 8, 15, 10, 19, GRASS);
  fillRect(m, 13, 5, 14, 8, GRASS);
  fillRect(m, 13, 11, 14, 14, GRASS);
  fillRect(m, 6, 6, 7, 7, BRICK);
  fillRect(m, 6, 12, 7, 13, BRICK);
  fillRect(m, 4, 3, 5, 4, BRICK);
  fillRect(m, 4, 15, 5, 16, BRICK);
  fillRect(m, 11, 8, 12, 11, GLASS);
  return done(m);
}

// ============================================================
//  MEDIUM-HARD — Levels 11-13
// ============================================================

function level11() {
  const m = blankMap();
  fillRect(m, 16, 5, 17, 6, BRICK);
  fillRect(m, 16, 13, 17, 14, BRICK);
  fillRect(m, 5, 1, 7, 4, GLASS);
  fillRect(m, 5, 15, 7, 18, GLASS);
  fillRect(m, 13, 1, 14, 4, GLASS);
  fillRect(m, 13, 15, 14, 18, GLASS);
  fillRect(m, 9, 5, 9, 14, BRICK);
  fillRect(m, 6, 9, 12, 9, BRICK);
  m[9][9] = EMPTY;
  fillRect(m, 2, 8, 3, 11, GRASS);
  return done(m);
}

function level12() {
  const m = blankMap();
  fillRect(m, 17, 6, 17, 13, BRICK);
  fillRect(m, 3, 3, 3, 16, GLASS);
  fillRect(m, 6, 3, 6, 6, GLASS);
  fillRect(m, 6, 13, 6, 16, GLASS);
  fillRect(m, 9, 3, 9, 6, GLASS);
  fillRect(m, 9, 13, 9, 16, GLASS);
  fillRect(m, 8, 7, 8, 12, BRICK);
  fillRect(m, 12, 5, 12, 14, BRICK);
  m[12][9] = EMPTY; m[12][10] = EMPTY;
  fillRect(m, 5, 7, 5, 12, RIVER);
  fillRect(m, 15, 2, 15, 17, RIVER);
  return done(m);
}

function level13() {
  const m = blankMap();
  fillRect(m, 16, 5, 17, 7, BRICK);
  fillRect(m, 16, 12, 17, 14, BRICK);
  fillRect(m, 4, 5, 16, 5, RIVER);
  fillRect(m, 4, 14, 16, 14, RIVER);
  fillRect(m, 6, 6, 7, 13, GLASS);
  m[6][9] = EMPTY; m[6][10] = EMPTY;
  fillRect(m, 10, 6, 10, 13, GLASS);
  m[10][9] = EMPTY; m[10][10] = EMPTY;
  fillRect(m, 13, 6, 13, 13, GLASS);
  m[13][9] = EMPTY; m[13][10] = EMPTY;
  fillRect(m, 3, 3, 3, 4, BRICK);
  fillRect(m, 3, 15, 3, 16, BRICK);
  fillRect(m, 15, 3, 15, 4, GRASS);
  fillRect(m, 15, 15, 15, 16, GRASS);
  return done(m);
}

// ============================================================
//  HARD — Levels 14-16
// ============================================================

function level14() {
  const m = blankMap();
  fillRect(m, 17, 7, 17, 12, BRICK);
  fillRect(m, 4, 1, 5, 2, GLASS);
  fillRect(m, 4, 17, 5, 18, GLASS);
  fillRect(m, 8, 3, 9, 5, GLASS);
  fillRect(m, 8, 14, 9, 16, GLASS);
  fillRect(m, 12, 7, 13, 12, GLASS);
  fillRect(m, 6, 9, 7, 10, BRICK);
  fillRect(m, 2, 5, 2, 14, BRICK);
  m[2][9] = EMPTY; m[2][10] = EMPTY;
  fillRect(m, 0, 6, 1, 13, GRASS);
  return done(m);
}

function level15() {
  const m = blankMap();
  fillRect(m, 17, 8, 17, 11, BRICK);
  fillRect(m, 4, 2, 5, 5, GLASS);
  fillRect(m, 4, 14, 5, 17, GLASS);
  fillRect(m, 8, 5, 9, 14, GLASS);
  m[8][9] = EMPTY; m[8][10] = EMPTY;
  fillRect(m, 12, 0, 13, 4, GLASS);
  fillRect(m, 12, 15, 13, 19, GLASS);
  fillRect(m, 3, 7, 3, 12, BRICK);
  fillRect(m, 7, 2, 7, 3, BRICK);
  fillRect(m, 7, 16, 7, 17, BRICK);
  m[3][9] = EMPTY; m[3][10] = EMPTY;
  fillRect(m, 1, 7, 2, 12, GRASS);
  return done(m);
}

function level16() {
  const m = blankMap();
  fillRect(m, 17, 9, 17, 10, BRICK);
  fillRect(m, 6, 1, 7, 3, GLASS);
  fillRect(m, 6, 16, 7, 18, GLASS);
  fillRect(m, 10, 4, 11, 8, GLASS);
  fillRect(m, 10, 11, 11, 15, GLASS);
  fillRect(m, 3, 6, 4, 13, GLASS);
  m[3][8] = EMPTY; m[3][9] = EMPTY; m[3][10] = EMPTY; m[3][11] = EMPTY;
  fillRect(m, 14, 1, 14, 6, RIVER);
  fillRect(m, 14, 13, 14, 18, RIVER);
  fillRect(m, 2, 2, 2, 4, BRICK);
  fillRect(m, 2, 15, 2, 17, BRICK);
  fillRect(m, 0, 5, 1, 14, GRASS);
  return done(m);
}

// ============================================================
//  VERY HARD — Levels 17-20
// ============================================================

function level17() {
  const m = blankMap();
  fillRect(m, 3, 3, 4, 8, GLASS);
  fillRect(m, 3, 11, 4, 16, GLASS);
  fillRect(m, 7, 5, 8, 7, GLASS);
  fillRect(m, 7, 12, 8, 14, GLASS);
  fillRect(m, 11, 1, 12, 5, GLASS);
  fillRect(m, 11, 14, 12, 18, GLASS);
  fillRect(m, 14, 6, 15, 13, GLASS);
  m[14][9] = EMPTY; m[14][10] = EMPTY;
  fillRect(m, 5, 0, 5, 2, BRICK);
  fillRect(m, 5, 17, 5, 19, BRICK);
  fillRect(m, 9, 8, 10, 11, BRICK);
  fillRect(m, 2, 9, 2, 10, GRASS);
  fillRect(m, 7, 2, 8, 4, GRASS);
  fillRect(m, 7, 15, 8, 17, GRASS);
  return done(m);
}

function level18() {
  const m = blankMap();
  fillRect(m, 4, 2, 5, 17, GLASS);
  m[4][3] = EMPTY; m[4][4] = EMPTY;
  m[4][6] = EMPTY; m[4][7] = EMPTY;
  m[4][12] = EMPTY; m[4][13] = EMPTY;
  m[4][15] = EMPTY; m[4][16] = EMPTY;
  fillRect(m, 9, 0, 10, 8, GLASS);
  fillRect(m, 9, 11, 10, 19, GLASS);
  fillRect(m, 14, 3, 15, 6, GLASS);
  fillRect(m, 14, 13, 15, 16, GLASS);
  fillRect(m, 2, 5, 3, 6, BRICK);
  fillRect(m, 2, 13, 3, 14, BRICK);
  fillRect(m, 7, 9, 8, 10, BRICK);
  fillRect(m, 12, 7, 13, 12, BRICK);
  fillRect(m, 0, 1, 1, 5, GRASS);
  fillRect(m, 0, 14, 1, 18, GRASS);
  return done(m);
}

function level19() {
  const m = blankMap();
  fillRect(m, 5, 1, 6, 7, GLASS);
  fillRect(m, 5, 12, 6, 18, GLASS);
  fillRect(m, 10, 3, 11, 16, GLASS);
  m[10][5] = EMPTY; m[10][6] = EMPTY;
  m[10][8] = EMPTY; m[10][9] = EMPTY; m[10][10] = EMPTY; m[10][11] = EMPTY;
  m[10][13] = EMPTY; m[10][14] = EMPTY;
  fillRect(m, 2, 4, 2, 5, BRICK);
  fillRect(m, 2, 14, 2, 15, BRICK);
  fillRect(m, 8, 0, 8, 2, BRICK);
  fillRect(m, 8, 17, 8, 19, BRICK);
  fillRect(m, 3, 8, 3, 11, RIVER);
  fillRect(m, 14, 0, 15, 19, RIVER);
  m[14][9] = EMPTY; m[14][10] = EMPTY;
  return done(m);
}

function level20() {
  const m = blankMap();
  fillRect(m, 3, 2, 4, 17, GLASS);
  m[3][1] = EMPTY; m[3][2] = EMPTY;
  m[3][5] = EMPTY; m[3][6] = EMPTY; m[3][7] = EMPTY;
  m[3][12] = EMPTY; m[3][13] = EMPTY; m[3][14] = EMPTY;
  m[3][17] = EMPTY; m[3][18] = EMPTY;
  fillRect(m, 8, 4, 9, 15, GLASS);
  m[8][4] = EMPTY; m[8][5] = EMPTY; m[8][6] = EMPTY;
  m[8][8] = EMPTY; m[8][9] = EMPTY; m[8][10] = EMPTY; m[8][11] = EMPTY;
  m[8][13] = EMPTY; m[8][14] = EMPTY; m[8][15] = EMPTY;
  fillRect(m, 13, 1, 14, 18, GLASS);
  m[13][2] = EMPTY; m[13][3] = EMPTY;
  m[13][7] = EMPTY; m[13][8] = EMPTY;
  m[13][11] = EMPTY; m[13][12] = EMPTY;
  m[13][16] = EMPTY; m[13][17] = EMPTY;
  fillRect(m, 1, 4, 1, 5, BRICK);
  fillRect(m, 1, 14, 1, 15, BRICK);
  fillRect(m, 6, 1, 7, 3, BRICK);
  fillRect(m, 6, 16, 7, 18, BRICK);
  fillRect(m, 11, 8, 12, 11, BRICK);
  fillRect(m, 0, 7, 1, 12, GRASS);
  fillRect(m, 15, 5, 16, 14, GRASS);
  return done(m);
}

const MAPS = [
  level1(), level2(), level3(), level4(), level5(),
  level6(), level7(), level8(), level9(), level10(),
  level11(), level12(), level13(), level14(), level15(),
  level16(), level17(), level18(), level19(), level20(),
];
