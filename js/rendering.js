// ============================================================
//  RENDERING — All drawing functions
// ============================================================

function render() {
  ctx.clearRect(0, 0, W, H);

  if (game.state === 'menu') { drawMenu(); return; }

  if (game.state === 'gameover') {
    drawGame();
    drawOverlay('游戏结束', 'GAME OVER', '#ff4444', '按 Enter 重新开始');
    return;
  }

  if (game.state === 'levelComplete') {
    drawGame();
    const mapIdx = (game.level - 1) % MAPS.length;
    const mapName = LEVEL_NAMES[mapIdx];
    drawOverlay('关卡通过', `第 ${game.level} 关 · ${mapName}`, '#00ff41', '准备中...');
    return;
  }

  drawGame();

  if (game.state === 'paused') {
    drawOverlay('暂停', 'PAUSED', '#ffaa00', '按 P 继续');
  }
}

// ---------------------------------------------------------------
//  Main game rendering
// ---------------------------------------------------------------
function drawGame() {
  // --- Pass 1: terrain (all tiles EXCEPT grass) ---
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = game.map[r][c];
      const x = c * TILE;
      const y = r * TILE;

      if (tile === BRICK) {
        drawBrickTile(x, y, r, c);
      } else if (tile === STEEL) {
        drawSteelTile(x, y);
      } else if (tile === GLASS) {
        drawGlassTile(x, y);
      } else if (tile === RIVER) {
        drawRiverTile(x, y);
      }
    }
  }

  // --- Draw base ---
  drawBase();

  // --- Draw entities (tanks, bullets, explosions) ---
  for (const enemy of game.enemiesAlive) enemy.draw(ctx);
  if (game.player) game.player.draw(ctx);
  for (const bullet of game.bullets) bullet.draw(ctx);
  // Explosions drawn at the end so nothing overlaps them
  for (const exp of game.explosions) exp.draw(ctx);

  // --- Fruits (power-ups) ---
  for (const fruit of game.fruits) fruit.draw(ctx);

  // --- Pass 2: draw grass OVERLAY on top of everything ---
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (game.map[r][c] === GRASS) {
        drawGrass(c * TILE, r * TILE);
      }
    }
  }
}

// ---------------------------------------------------------------
//  Brick tile with partial damage
// ---------------------------------------------------------------
function drawBrickTile(x, y, r, c) {
  const img = getImage(IMAGE_PATHS.tiles[BRICK]);
  const canDraw = img && img.complete && img.naturalWidth > 0;

  if (canDraw) {
    ctx.drawImage(img, x, y, TILE, TILE);
  } else {
    // Fallback
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = '#6B3410';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, TILE / 2, TILE / 2);
    ctx.strokeRect(x + TILE / 2, y, TILE / 2, TILE / 2);
    ctx.strokeRect(x, y + TILE / 2, TILE / 2, TILE / 2);
    ctx.strokeRect(x + TILE / 2, y + TILE / 2, TILE / 2, TILE / 2);
  }

  // Overlay damage — show missing chunks from the side the bullet hit
  // (the impact side, i.e. the side closest to the tank that fired)
  const dmg = game.brickDamage[r] && game.brickDamage[r][c];
  if (!dmg || dmg.amount <= 0) return;

  ctx.fillStyle = '#1a1a2e'; // match canvas background
  const dirs = dmg.dirs;
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];
    const isLastDifferent = (i === dirs.length - 1 && dirs.length >= 2);
    const portion = isLastDifferent ? 0.5 : 1 / 3;
    // Damage appears on the side the bullet came FROM (opposite to bullet dir)
    switch (dir) {
      case DIR.UP:    // bullet from below → damage bottom
        ctx.fillRect(x, y + TILE * (1 - portion), TILE, TILE * portion);
        break;
      case DIR.DOWN:  // bullet from above → damage top
        ctx.fillRect(x, y, TILE, TILE * portion);
        break;
      case DIR.LEFT:  // bullet from right → damage right
        ctx.fillRect(x + TILE * (1 - portion), y, TILE * portion, TILE);
        break;
      case DIR.RIGHT: // bullet from left → damage left
        ctx.fillRect(x, y, TILE * portion, TILE);
        break;
    }
  }
  // For same-direction double-hit (amount≈2/3, 1 dir), show the larger chunk
  if (dirs.length === 1 && dmg.amount >= 0.5) {
    const dir = dirs[0];
    // Damage appears on the side the bullet came FROM
    switch (dir) {
      case DIR.UP:    // bullet from below → damage bottom 2/3
        ctx.fillRect(x, y + TILE * (1 / 3), TILE, TILE * (2 / 3)); break;
      case DIR.DOWN:  // bullet from above → damage top 2/3
        ctx.fillRect(x, y, TILE, TILE * (2 / 3)); break;
      case DIR.LEFT:  // bullet from right → damage right 2/3
        ctx.fillRect(x + TILE * (1 / 3), y, TILE * (2 / 3), TILE); break;
      case DIR.RIGHT: // bullet from left → damage left 2/3
        ctx.fillRect(x, y, TILE * (2 / 3), TILE); break;
    }
  }
}

// ---------------------------------------------------------------
//  Steel tile
// ---------------------------------------------------------------
function drawSteelTile(x, y) {
  if (drawImageAsset(ctx, IMAGE_PATHS.tiles[STEEL], x, y, TILE, TILE)) return;
  // Fallback: same as glass
  drawGlassFallback(x, y);
}

// ---------------------------------------------------------------
//  River decoration
// ---------------------------------------------------------------
function drawRiverTile(x, y) {
  const grad = ctx.createLinearGradient(x, y, x, y + TILE);
  grad.addColorStop(0, '#1CA7EC');
  grad.addColorStop(0.5, '#0B76C5');
  grad.addColorStop(1, '#084B8A');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, TILE, TILE);

  ctx.strokeStyle = 'rgba(210, 245, 255, 0.45)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const yy = y + 7 + i * 9 + Math.sin((game.frame + x + i * 30) / 18) * 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, yy);
    ctx.quadraticCurveTo(x + TILE * 0.35, yy - 4, x + TILE * 0.62, yy);
    ctx.quadraticCurveTo(x + TILE * 0.82, yy + 3, x + TILE - 2, yy - 1);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x, y, TILE, 2);
}

// ---------------------------------------------------------------
//  Glass barrier
// ---------------------------------------------------------------
function drawGlassTile(x, y, size = TILE) {
  if (drawImageAsset(ctx, IMAGE_PATHS.tiles[GLASS], x, y, size, size)) return;
  drawGlassFallback(x, y, size);
}

function drawGlassFallback(x, y, size = TILE) {
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, 'rgba(230, 252, 255, 0.62)');
  grad.addColorStop(0.45, 'rgba(94, 205, 255, 0.42)');
  grad.addColorStop(1, 'rgba(20, 96, 150, 0.66)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);

  ctx.strokeStyle = 'rgba(210, 250, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y + size * 0.69);
  ctx.lineTo(x + size * 0.69, y + size * 0.16);
  ctx.moveTo(x + size * 0.44, y + size * 0.84);
  ctx.lineTo(x + size * 0.88, y + size * 0.41);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(x + size * 0.12, y + size * 0.12, size * 0.76, Math.max(2, size * 0.12));
  ctx.fillRect(x + size * 0.12, y + size * 0.12, Math.max(2, size * 0.12), size * 0.76);

  ctx.strokeStyle = 'rgba(8, 52, 86, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + size * 0.12, y + size * 0.12, size * 0.76, size * 0.76);
}

// ---------------------------------------------------------------
//  Grass tile (drawn on top of everything)
// ---------------------------------------------------------------
function drawGrass(x, y) {
  if (drawImageAsset(ctx, IMAGE_PATHS.tiles[GRASS], x, y, TILE, TILE)) return;

  const base = ctx.createLinearGradient(x, y, x, y + TILE);
  base.addColorStop(0, '#295f20');
  base.addColorStop(1, '#143a16');
  ctx.fillStyle = base;
  ctx.fillRect(x, y, TILE, TILE);

  const colors = ['#62b84a', '#3f8f35', '#79d25a', '#2f752a', '#9be272'];
  for (let i = 0; i < 24; i++) {
    const gx = x + ((i * 7 + 3) % TILE);
    const gy = y + TILE - 2 - ((i * 5) % 18);
    const h = 7 + (i % 5);
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx + (i % 2 === 0 ? -3 : 3), gy - h / 2, gx + (i % 3) - 1, gy - h);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(160, 235, 95, 0.18)';
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(x + ((i * 11 + 2) % TILE), y + ((i * 13 + 5) % TILE), 2, 2);
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fillRect(x, y + TILE - 3, TILE, 3);
}

// ---------------------------------------------------------------
//  Base / Eagle
// ---------------------------------------------------------------
function drawBase() {
  const bx = BASE_X, by = BASE_Y;

  if (game.baseAlive) {
    if (drawImageAsset(ctx, IMAGE_PATHS.eagle, bx, by, BASE_W, BASE_H)) return;

    // Fallback: programmatic eagle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(bx + TILE - 4, by + 4, 4, TILE - 4);
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    const fx = bx + TILE / 2, fy = by + TILE / 2 + 2;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 10);
    ctx.lineTo(fx + 10, fy + 4);
    ctx.lineTo(fx + 4, fy + 4);
    ctx.lineTo(fx + 6, fy + 10);
    ctx.lineTo(fx, fy + 6);
    ctx.lineTo(fx - 6, fy + 10);
    ctx.lineTo(fx - 4, fy + 4);
    ctx.lineTo(fx - 10, fy + 4);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Destroyed
    ctx.fillStyle = '#333';
    ctx.fillRect(bx + 4, by + 4, TILE - 8, TILE - 8);
    ctx.fillStyle = '#555';
    ctx.fillRect(bx + 2, by + TILE - 4, TILE - 4, 4);
    ctx.fillStyle = '#444';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(bx + rand(2, TILE - 10), by + rand(2, TILE - 10), rand(4, 8), rand(3, 6));
    }
  }
}

// ---------------------------------------------------------------
//  Menu screen
// ---------------------------------------------------------------
function drawMenu() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
  ctx.lineWidth = 1;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.strokeRect(c * TILE, r * TILE, TILE, TILE);
    }
  }

  // Decorative enemy tanks
  const demoColors = ['#E74C3C', '#2ECC71', '#E74C3C', '#2ECC71', '#E74C3C'];
  for (let i = 0; i < 5; i++) {
    const tx = 30 + i * 130;
    const ty = 60 + Math.sin(Date.now() / 1000 + i) * 10;
    ctx.fillStyle = demoColors[i];
    ctx.fillRect(tx, ty, TANK_SIZE, TANK_SIZE);
    ctx.fillStyle = '#922B21';
    ctx.fillRect(tx, ty + 2, 5, TANK_SIZE - 4);
    ctx.fillRect(tx + TANK_SIZE - 5, ty + 2, 5, TANK_SIZE - 4);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(tx + 7, ty + 3, 3, TANK_SIZE - 6);
  }

  ctx.textAlign = 'center';

  // Title shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.font = 'bold 56px "Courier New", monospace';
  ctx.fillText('坦克大战', W / 2 + 3, 253);

  // Title
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 56px "Courier New", monospace';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 20;
  ctx.fillText('坦克大战', W / 2, 250);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#00ff41';
  ctx.font = '20px "Courier New", monospace';
  ctx.fillText('BATTLE CITY', W / 2, 295);

  ctx.fillStyle = '#4a6fa5';
  ctx.font = '15px "Courier New", monospace';
  ctx.fillText('单人经典坦克射击游戏 · 20 大关卡', W / 2, 340);

  // Tile legend
  ctx.font = '13px "Courier New", monospace';
  const legendY = 385;
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(W / 2 - 160, legendY - 10, 20, 20);
  ctx.fillStyle = '#aaa';
  ctx.fillText('砖墙', W / 2 - 132, legendY + 5);

  drawGlassTile(W / 2 - 60, legendY - 10, 20);
  ctx.fillStyle = '#aaa';
  ctx.fillText('钢墙', W / 2 - 32, legendY + 5);

  drawGlassTile(W / 2 + 40, legendY - 10, 20);
  ctx.fillStyle = '#aaa';
  ctx.fillText('玻璃', W / 2 + 68, legendY + 5);

  ctx.fillStyle = '#2d5a1e';
  ctx.fillRect(W / 2 + 120, legendY - 10, 20, 20);
  ctx.fillStyle = '#5aad42';
  ctx.fillRect(W / 2 + 122, legendY - 8, 3, 5);
  ctx.fillRect(W / 2 + 126, legendY - 6, 3, 5);
  ctx.fillStyle = '#aaa';
  ctx.fillText('草丛', W / 2 + 148, legendY + 5);

  const blink = Math.floor(Date.now() / 500) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillText('按 Enter 开始游戏', W / 2, 455);
  }

  ctx.fillStyle = '#4a6fa5';
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText('方向键/WASD 移动 | 空格/J 射击 | P 暂停', W / 2, 500);
}

// ---------------------------------------------------------------
//  Overlay (pause / game over / level complete)
// ---------------------------------------------------------------
function drawOverlay(title, subtitle, color, prompt) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText(subtitle, W / 2, H / 2 - 30);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText(title, W / 2, H / 2 - 80);

  if (prompt) {
    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#aaa';
      ctx.font = '16px "Courier New", monospace';
      ctx.fillText(prompt, W / 2, H / 2 + 50);
    }
  }
}
