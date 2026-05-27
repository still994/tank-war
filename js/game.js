// ============================================================
//  GAME — State, init, update, main loop
// ============================================================

// ----- Game state -----
let game = {
  state: 'menu',       // menu | playing | paused | gameover | levelComplete
  score: 0,
  lives: 3,
  level: 1,
  enemiesTotal: 20,
  enemiesSpawned: 0,
  enemiesAlive: [],
  enemiesKilled: 0,
  maxOnScreen: 4,
  spawnTimer: 0,
  spawnInterval: 120,
  player: null,
  bullets: [],
  explosions: [],
  fruits: [],
  map: [],
  brickDamage: [],
  baseAlive: true,
  eagleProtectionLevel: 0,
  frame: 0,
  levelTransitionTimer: 0,
};

// ----- Canvas & HUD refs -----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const enemyDisplay = document.getElementById('enemyDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const levelDisplay = document.getElementById('levelDisplay');

// ----- Utility -----
function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ----- Brick damage system -----
// brickDamage[row][col] = { amount: 0-1, dirs: [dir, ...] } or null
function initBrickDamage() {
  game.brickDamage = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// Apply pre-damage to eagle protection bricks (outer side chipped)
// Corner bricks: top half removed so they don't protrude above the side bricks
function initEagleBricksDamage() {
  // Damage direction maps to which side shows damage:
  // DIR.UP → bottom, DIR.DOWN → top, DIR.LEFT → right, DIR.RIGHT → left
  const ring = [
    { r: 18, c: 8, dir: DIR.DOWN,  amount: 0.5 },    // top-left, lower half only
    { r: 18, c: 9, dir: DIR.DOWN,  amount: 1 / 3 },   // above, chipped from top
    { r: 18, c: 10, dir: DIR.DOWN, amount: 0.5 },     // top-right, lower half only
    { r: 19, c: 8, dir: DIR.RIGHT, amount: 1 / 3 },   // left, chipped from left
    { r: 19, c: 10, dir: DIR.LEFT,  amount: 1 / 3 },   // right, chipped from right
  ];
  for (const { r, c, dir, amount } of ring) {
    if (game.map[r] && game.map[r][c] === BRICK) {
      game.brickDamage[r][c] = { amount, dirs: [dir] };
    }
  }
}

// Damage a brick at (row, col) from bullet direction.
// Returns true if the brick was fully destroyed.
function damageBrick(row, col, dir) {
  if (!game.brickDamage[row]) return false;
  let dmg = game.brickDamage[row][col];
  if (!dmg) {
    dmg = { amount: 0, dirs: [] };
    game.brickDamage[row][col] = dmg;
  }
  // First hit → +1/3; same direction → +1/3; different direction → +1/2
  const isNew = dmg.dirs.length === 0 || !dmg.dirs.includes(dir);
  dmg.amount += isNew ? (dmg.dirs.length === 0 ? 1 / 3 : 1 / 2) : 1 / 3;
  if (isNew) dmg.dirs.push(dir);
  if (dmg.amount >= 1.0) {
    game.map[row][col] = EMPTY;
    game.brickDamage[row][col] = null;
    return true;
  }
  return false;
}

// ----- Map -----
function loadMap() {
  const idx = (game.level - 1) % MAPS.length;
  game.map = MAPS[idx].map(row => [...row]);
  initBrickDamage();
  game.baseAlive = true;
  applyEagleProtection();
  initEagleBricksDamage();
}

function getLevelSettings(level) {
  return {
    enemiesTotal: Math.min(28, 8 + level * 2),
    maxOnScreen: Math.min(7, 2 + Math.floor((level + 1) / 2)),
    spawnInterval: Math.max(55, 150 - level * 8),
  };
}

function applyLevelSettings() {
  const settings = getLevelSettings(game.level);
  game.enemiesTotal = settings.enemiesTotal;
  game.maxOnScreen = settings.maxOnScreen;
  game.spawnInterval = settings.spawnInterval;
}

// ----- Enemy spawning -----
function spawnEnemy() {
  if (game.enemiesSpawned >= game.enemiesTotal) return;
  if (game.enemiesAlive.filter(e => e.alive).length >= game.maxOnScreen) return;

  const shuffled = [...SPAWN_POINTS].sort(() => Math.random() - 0.5);
  for (const [sx, sy] of shuffled) {
    const testTank = new Tank(sx, sy, DIR.DOWN, false);
    if (testTank.canMoveTo(sx, sy)) {
      const isFast = Math.random() < Math.min(0.42, 0.08 + game.level * 0.025);
      const enemy = new Tank(sx, sy, DIR.DOWN, false);
      enemy.speed = isFast ? 1.35 + game.level * 0.03 : 0.85 + game.level * 0.035;
      enemy.points = isFast ? 200 : 100;
      enemy.maxCooldown = isFast ? 60 : 48;
      enemy.aiTimer = rand(30, 90);
      enemy.dir = DIR.DOWN;
      enemy.moveDir = DIR.DOWN;
      game.enemiesAlive.push(enemy);
      game.enemiesSpawned++;
      game.explosions.push(new Explosion(sx + HALF_TANK, sy + HALF_TANK, false));
      return;
    }
  }
}

// ----- Game init / level -----
function initGame() {
  game.score = 0;
  game.lives = 3;
  game.level = 1;
  game.eagleProtectionLevel = 0;
  applyLevelSettings();
  loadMap();
  game.enemiesSpawned = 0;
  game.enemiesAlive = [];
  game.enemiesKilled = 0;
  game.bullets = [];
  game.explosions = [];
  game.fruits = [];
  game.frame = 0;
  game.spawnTimer = 0;
  game.baseAlive = true;
  game.state = 'playing';

  game.player = new Tank(PLAYER_SPAWN.x, PLAYER_SPAWN.y, DIR.UP, true);
  game.player.invincible = true;
  game.player.invincibleTimer = 120;

  startBackgroundMusic();
  updateHUD();
}

function nextLevel() {
  game.level++;
  applyLevelSettings();
  game.enemiesSpawned = 0;
  game.enemiesAlive = [];
  game.enemiesKilled = 0;
  game.bullets = [];
  game.fruits = [];
  game.spawnTimer = 0;
  game.eagleProtectionLevel = 0;
  game.state = 'levelComplete';
  game.levelTransitionTimer = 120;

  loadMap();

  game.player.x = PLAYER_SPAWN.x;
  game.player.y = PLAYER_SPAWN.y;
  game.player.dir = DIR.UP;
  game.player.alive = true;
  game.player.invincible = true;
  game.player.invincibleTimer = 120;
  game.player.cooldown = 0;

  updateHUD();
}

function respawnPlayer() {
  game.lives--;
  if (game.lives <= 0) {
    game.state = 'gameover';
    soundGameOver();
    updateHUD();
    return;
  }

  game.player = new Tank(PLAYER_SPAWN.x, PLAYER_SPAWN.y, DIR.UP, true);
  game.player.invincible = true;
  game.player.invincibleTimer = 150;
  game.player.speed = 2.2 + game.level * 0.05;
  updateHUD();
}

// ----- Fruit spawning / collection -----
function spawnFruit() {
  // Collect all EMPTY tiles
  const emptyTiles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (game.map[r][c] === EMPTY) emptyTiles.push([c, r]);
    }
  }
  if (emptyTiles.length === 0) return;

  // Pick a random empty tile
  const [col, row] = emptyTiles[rand(0, emptyTiles.length - 1)];
  const fx = col * TILE + (TILE - FRUIT_SIZE) / 2;
  const fy = row * TILE + (TILE - FRUIT_SIZE) / 2;

  // Avoid spawning on the base
  if (game.baseAlive && rectOverlap(
    { x: fx, y: fy, w: FRUIT_SIZE, h: FRUIT_SIZE },
    { x: BASE_X, y: BASE_Y, w: BASE_W, h: BASE_H }
  )) return;

  // Avoid spawning on the player
  if (game.player && game.player.alive && rectOverlap(
    { x: fx, y: fy, w: FRUIT_SIZE, h: FRUIT_SIZE },
    { x: game.player.x, y: game.player.y, w: TANK_SIZE, h: TANK_SIZE }
  )) return;

  const type = chooseFruitType();
  game.fruits.push(new Fruit(fx, fy, type));
}

function chooseFruitType() {
  const roll = Math.random();
  if (roll < 0.32) return FRUIT_EVOLVE;
  if (roll < 0.52) return FRUIT_LIFE;
  if (roll < 0.68) return FRUIT_BOMB;
  if (roll < 0.84) return FRUIT_INVINCIBLE;
  return FRUIT_PROTECT;
}

function addPlayerLife(amount = 1) {
  game.lives = Math.max(0, game.lives + amount);
  return game.lives;
}

function explodeAllEnemies() {
  let exploded = 0;
  for (const enemy of game.enemiesAlive) {
    if (!enemy.alive) continue;
    enemy.alive = false;
    exploded++;
    game.score += enemy.points || 100;
    game.enemiesKilled++;
    game.explosions.push(new Explosion(enemy.x + HALF_TANK, enemy.y + HALF_TANK, true));
  }
  if (exploded > 0) soundExplode();
}

function grantTemporaryInvincibility(frames = FRUIT_INVINCIBLE_FRAMES) {
  if (!game.player) return;
  game.player.invincible = true;
  game.player.invincibleTimer = Math.max(game.player.invincibleTimer || 0, frames);
}

function applyEagleProtection() {
  if (!game.map || game.eagleProtectionLevel <= 0) return;
  // One ring of indestructible steel around the 1-tile eagle
  const tile = STEEL;
  const protectionCells = [
    [18, 8], [18, 9], [18, 10],  // top row
    [19, 8], [19, 10],            // left, right
  ];
  for (const [row, col] of protectionCells) {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      game.map[row][col] = tile;
      game.brickDamage[row][col] = null; // clear any damage state
    }
  }
}

function upgradeEagleProtection() {
  if (game.eagleProtectionLevel >= 2) {
    game.score += 200;
    return;
  }
  game.eagleProtectionLevel++;
  applyEagleProtection();
}

function collectFruit(fruit) {
  if (fruit.type === FRUIT_EVOLVE) {
    if (game.player.level < 3) {
      game.player.level++;
      game.player.applyLevelStats();
      game.explosions.push(new Explosion(fruit.x + FRUIT_SIZE / 2, fruit.y + FRUIT_SIZE / 2, false));
      soundPickup();
    } else {
      game.score += 200;
      soundPickup();
    }
  } else if (fruit.type === FRUIT_LIFE) {
    addPlayerLife(1);
    game.explosions.push(new Explosion(fruit.x + FRUIT_SIZE / 2, fruit.y + FRUIT_SIZE / 2, false));
    soundPickup();
  } else if (fruit.type === FRUIT_BOMB) {
    explodeAllEnemies();
    game.explosions.push(new Explosion(fruit.x + FRUIT_SIZE / 2, fruit.y + FRUIT_SIZE / 2, true));
    soundPickup();
  } else if (fruit.type === FRUIT_INVINCIBLE) {
    grantTemporaryInvincibility();
    game.explosions.push(new Explosion(fruit.x + FRUIT_SIZE / 2, fruit.y + FRUIT_SIZE / 2, false));
    soundPickup();
  } else if (fruit.type === FRUIT_PROTECT) {
    upgradeEagleProtection();
    game.explosions.push(new Explosion(fruit.x + FRUIT_SIZE / 2, fruit.y + FRUIT_SIZE / 2, false));
    soundPickup();
  }
  updateHUD();
}

// ----- HUD -----
function updateHUD() {
  scoreDisplay.textContent = `SCORE: ${game.score}`;
  const remaining = game.enemiesTotal - game.enemiesSpawned +
                    game.enemiesAlive.filter(e => e.alive).length;
  enemyDisplay.textContent = `ENEMIES: ${remaining}`;
  const mapIdx = (game.level - 1) % MAPS.length;
  levelDisplay.innerHTML = `LV:${game.level} ${LEVEL_NAMES[mapIdx]}`;

  const tankLvDisplay = document.getElementById('tankLevelDisplay');
  if (tankLvDisplay && game.player) {
    const stars = '★'.repeat(game.player.level) + '☆'.repeat(3 - game.player.level);
    tankLvDisplay.textContent = `TANK:${stars}`;
    tankLvDisplay.style.color = game.player.level >= 3 ? '#FFD700' : game.player.level >= 2 ? '#2ECC71' : '#aaa';
  }

  let livesHtml = '';
  for (let i = 0; i < game.lives; i++) {
    livesHtml += '<span class="life-icon"></span>';
  }
  livesDisplay.innerHTML = livesHtml || '<span style="color:#ff4444">✖</span>';
}

// ----- Update -----
function update() {
  game.frame++;

  if (game.state === 'menu') return;
  if (game.state === 'gameover') return;

  if (game.state === 'levelComplete') {
    game.levelTransitionTimer--;
    if (game.levelTransitionTimer <= 0) game.state = 'playing';
    return;
  }

  if (game.state === 'paused') return;

  // Player
  if (game.player && game.player.alive) {
    game.player.update();
  } else if (game.player && !game.player.alive &&
             game.explosions.filter(e => e.alive).length === 0) {
    respawnPlayer();
  }

  // Enemies
  for (const enemy of game.enemiesAlive) enemy.update();
  game.enemiesAlive = game.enemiesAlive.filter(e => e.alive);

  // Bullets
  for (const bullet of game.bullets) bullet.update();
  game.bullets = game.bullets.filter(b => b.alive);

  // Explosions
  for (const exp of game.explosions) exp.update();
  game.explosions = game.explosions.filter(e => e.alive);

  // Fruits
  for (const fruit of game.fruits) fruit.update();

  // Player-fruit collision
  if (game.player && game.player.alive) {
    for (let i = game.fruits.length - 1; i >= 0; i--) {
      const fruit = game.fruits[i];
      if (!fruit.alive) continue;
      if (rectOverlap(
        { x: game.player.x, y: game.player.y, w: TANK_SIZE, h: TANK_SIZE },
        { x: fruit.x, y: fruit.y, w: fruit.size, h: fruit.size }
      )) {
        fruit.alive = false;
        collectFruit(fruit);
      }
    }
  }
  game.fruits = game.fruits.filter(f => f.alive);

  // Spawn
  game.spawnTimer--;
  if (game.spawnTimer <= 0) {
    game.spawnTimer = Math.max(30, game.spawnInterval - game.level * 3);
    spawnEnemy();
  }

  // Win check
  if (game.enemiesKilled >= game.enemiesTotal) {
    nextLevel();
    return;
  }

  // Lose check (base)
  if (!game.baseAlive) {
    game.state = 'gameover';
    soundGameOver();
  }

  updateHUD();
}

// ----- Game loop -----
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// ----- Input -----
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  keys[e.code] = true;
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
      e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();

  if (e.key === 'Enter') {
    initAudio();
    if (game.state === 'menu' || game.state === 'gameover') {
      initGame();
    }
  }

  if (e.key === 'p' || e.key === 'P') {
    if (game.state === 'playing') game.state = 'paused';
    else if (game.state === 'paused') game.state = 'playing';
  }
});
document.addEventListener('keyup', e => {
  keys[e.key] = false;
  keys[e.code] = false;
});

// ----- Boot -----
updateHUD();
gameLoop();

console.log('🎮 坦克大战 — ', LEVEL_NAMES.join(' · '));
console.log('方向键/WASD: 移动 | 空格/J: 射击 | P: 暂停 | Enter: 开始');
