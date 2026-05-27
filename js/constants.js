// ============================================================
//  CONSTANTS
// ============================================================
const TILE = 32;
const COLS = 20;
const ROWS = 20;
const W = COLS * TILE; // 640
const H = ROWS * TILE; // 640
const TANK_SIZE = 28;
const HALF_TANK = TANK_SIZE / 2;
const BULLET_SIZE = 6;

const DIR = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

// Tile types
const EMPTY = 0;
const BRICK = 1;
const STEEL = 2;
const GRASS = 3;  // visual cover, tanks pass through
const GLASS = 4;  // glass barrier, breakable by level-3 player bullets
const RIVER = 5;  // decorative water, no gameplay effect

// Passable tiles (tanks can drive through)
const PASSABLE_TILES = new Set([EMPTY, GRASS, RIVER]);

// base flag position (col, row) - consistent for all maps
const BASE_COL = 9;
const BASE_ROW = 19;
const BASE_X = BASE_COL * TILE;
const BASE_Y = BASE_ROW * TILE;
const BASE_W = TILE;
const BASE_H = TILE;

// spawn points for enemies (x, y)
const SPAWN_POINTS = [
  [1 * TILE, 0],
  [9 * TILE, 0],
  [17 * TILE, 0],
];

// player start
const PLAYER_SPAWN = { x: 3 * TILE, y: 18 * TILE };

// Fruit
const FRUIT_SIZE = 24;
const FRUIT_EVOLVE = 0;
const FRUIT_LIFE = 1;
const FRUIT_BOMB = 2;
const FRUIT_INVINCIBLE = 3;
const FRUIT_PROTECT = 4;
const FRUIT_DROP_CHANCE = 0.22;
const FRUIT_LIFETIME = 600; // frames (~10s at 60fps)
const FRUIT_INVINCIBLE_FRAMES = 240; // 4s at 60fps

// Image assets under tank-game/images.
const IMAGE_PATHS = {
  player: {
    [DIR.UP]: 'images/tankU.gif',
    [DIR.RIGHT]: 'images/tankR.gif',
    [DIR.DOWN]: 'images/tankD.gif',
    [DIR.LEFT]: 'images/tankL.gif',
  },
  enemyNormal: 'images/BadTank1.png',
  enemyFast: 'images/BadTank2.png',
  bullets: {
    [DIR.UP]: 'images/bulletU.gif',
    [DIR.RIGHT]: 'images/bulletR.gif',
    [DIR.DOWN]: 'images/bulletD.gif',
    [DIR.LEFT]: 'images/bulletL.gif',
  },
  tiles: {
    [BRICK]: 'images/砖块.jpg',
    [STEEL]: 'images/square6.jpg',
    [GRASS]: 'images/草丛.jpg',
    [GLASS]: 'images/玻璃.jpg',
  },
  eagle: 'images/老鹰.jpg',
  explosionSmall: [
    'images/0.gif', 'images/1.gif', 'images/2.gif', 'images/3.gif',
    'images/4.gif', 'images/5.gif', 'images/6.gif', 'images/7.gif',
    'images/8.gif', 'images/9.gif', 'images/10.gif',
  ],
  explosionBig: [
    'images/e1.gif', 'images/e2.gif', 'images/e3.gif', 'images/e4.gif',
    'images/e5.gif', 'images/e6.gif', 'images/e7.gif', 'images/e8.gif',
    'images/e9.gif', 'images/e10.gif', 'images/e11.gif', 'images/e12.gif',
    'images/e13.gif', 'images/e14.gif', 'images/e15.gif', 'images/e16.gif',
  ],
};

const IMAGE_CACHE = new Map();

function getImage(src) {
  if (!src) return null;
  if (!IMAGE_CACHE.has(src)) {
    const img = new Image();
    img.src = src;
    IMAGE_CACHE.set(src, img);
  }
  return IMAGE_CACHE.get(src);
}

function preloadImages() {
  const collect = value => {
    if (typeof value === 'string') getImage(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };
  collect(IMAGE_PATHS);
}

preloadImages();
