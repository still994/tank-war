// ============================================================
//  ENTITIES — Tank, Bullet, Explosion
// ============================================================

function drawImageAsset(ctx, src, x, y, w, h) {
  const img = getImage(src);
  if (!img || !img.complete || img.naturalWidth === 0) return false;
  ctx.drawImage(img, x, y, w, h);
  return true;
}

function drawRotatedImageAsset(ctx, src, x, y, w, h, dir) {
  const img = getImage(src);
  if (!img || !img.complete || img.naturalWidth === 0) return false;

  const angle = [0, Math.PI / 2, Math.PI, -Math.PI / 2][dir] || 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  return true;
}

function drawHeartIcon(ctx, cx, cy, size) {
  const top = cy - size * 0.18;
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.32);
  ctx.bezierCurveTo(cx - size * 0.48, cy, cx - size * 0.48, top - size * 0.36, cx, top);
  ctx.bezierCurveTo(cx + size * 0.48, top - size * 0.36, cx + size * 0.48, cy, cx, cy + size * 0.32);
  ctx.closePath();
  ctx.fill();
}

function drawStarIcon(ctx, cx, cy, outerRadius, innerRadius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawBombIcon(ctx, cx, cy, size) {
  ctx.beginPath();
  ctx.arc(cx, cy + 2, size * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFF4B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.18, cy - size * 0.22);
  ctx.quadraticCurveTo(cx + size * 0.34, cy - size * 0.46, cx + size * 0.5, cy - size * 0.34);
  ctx.stroke();
  ctx.fillStyle = '#FFD84A';
  drawStarIcon(ctx, cx + size * 0.55, cy - size * 0.36, size * 0.16, size * 0.06);
}

function drawHelmetIcon(ctx, cx, cy, size) {
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.42, Math.PI, 0);
  ctx.lineTo(cx + size * 0.42, cy + size * 0.18);
  ctx.lineTo(cx - size * 0.42, cy + size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - size * 0.52, cy + size * 0.1, size * 1.04, size * 0.16);
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.38);
  ctx.lineTo(cx, cy + size * 0.16);
  ctx.stroke();
}

function drawShieldIcon(ctx, cx, cy, size) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.48);
  ctx.lineTo(cx + size * 0.42, cy - size * 0.28);
  ctx.lineTo(cx + size * 0.34, cy + size * 0.24);
  ctx.quadraticCurveTo(cx, cy + size * 0.5, cx - size * 0.34, cy + size * 0.24);
  ctx.lineTo(cx - size * 0.42, cy - size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// -------------------- Explosion --------------------
class Explosion {
  constructor(x, y, big = false) {
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.frames = big ? IMAGE_PATHS.explosionBig : IMAGE_PATHS.explosionSmall;
    this.maxFrame = this.frames.length;
    this.alive = true;
    this.size = big ? 70 : 46;
  }

  update() {
    this.frame++;
    if (this.frame >= this.maxFrame) this.alive = false;
  }

  draw(ctx) {
    const frameSrc = this.frames[Math.min(this.frame, this.frames.length - 1)];
    if (drawImageAsset(ctx, frameSrc, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)) {
      return;
    }

    const progress = this.frame / this.maxFrame;
    const s = this.size * (0.3 + progress * 0.7);
    const alpha = 1 - progress;

    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, s / 2);
    if (progress < 0.3) {
      grad.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
      grad.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.8})`);
      grad.addColorStop(1, `rgba(200, 50, 0, 0)`);
    } else {
      grad.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.6})`);
      grad.addColorStop(0.5, `rgba(200, 80, 20, ${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(100, 20, 0, 0)`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);

    if (progress < 0.4) {
      const coreSize = s * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress / 0.4) * 0.8})`;
      ctx.fillRect(this.x - coreSize / 2, this.y - coreSize / 2, coreSize, coreSize);
    }
  }
}


// -------------------- Fruit (power-up) --------------------
class Fruit {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = FRUIT_SIZE;
    this.alive = true;
    this.timer = FRUIT_LIFETIME;
    this.bobPhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.timer--;
    this.bobPhase += 0.06;
    if (this.timer <= 0) this.alive = false;
  }

  draw(ctx) {
    if (!this.alive) return;
    const alpha = Math.min(1, this.timer / 30);
    ctx.globalAlpha = alpha;

    const bx = this.x;
    const by = this.y + Math.sin(this.bobPhase) * 3;
    const s = this.size;
    const half = s / 2;
    const styles = {
      [FRUIT_EVOLVE]: ['#FFD84A', '#B98300', '#FFF7C2'],
      [FRUIT_LIFE]: ['#FF5A6C', '#9B1232', '#FFF0F3'],
      [FRUIT_BOMB]: ['#4B5563', '#111827', '#F9FAFB'],
      [FRUIT_INVINCIBLE]: ['#66E3FF', '#1457A8', '#E8FBFF'],
      [FRUIT_PROTECT]: ['#C084FC', '#5B21B6', '#F5E8FF'],
    };
    const [color1, color2, iconColor] = styles[this.type] || styles[FRUIT_LIFE];

    // Outer glow
    ctx.shadowColor = color1;
    ctx.shadowBlur = 18;

    // Power-up badge
    const grad = ctx.createLinearGradient(bx, by, bx + s, by + s);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx + half, by + half, half, 0, Math.PI * 2);
    ctx.fill();

    // White border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx + half, by + half, half - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(bx + half - 5, by + half - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Center icon
    ctx.fillStyle = iconColor;
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 4;
    switch (this.type) {
      case FRUIT_EVOLVE:
        drawStarIcon(ctx, bx + half, by + half, 8, 3.6);
        break;
      case FRUIT_BOMB:
        drawBombIcon(ctx, bx + half, by + half, 18);
        break;
      case FRUIT_INVINCIBLE:
        drawHelmetIcon(ctx, bx + half, by + half + 1, 18);
        break;
      case FRUIT_PROTECT:
        drawShieldIcon(ctx, bx + half, by + half, 17);
        break;
      default:
        drawHeartIcon(ctx, bx + half, by + half + 1, 17);
        break;
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}


// -------------------- Bullet --------------------
class Bullet {
  constructor(x, y, dir, owner, penetrateGlass = false) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = 5;
    this.alive = true;
    this.owner = owner;
    this.size = BULLET_SIZE;
    this.penetrateGlass = penetrateGlass;
  }

  update() {
    if (!this.alive) return;
    this.x += DX[this.dir] * this.speed;
    this.y += DY[this.dir] * this.speed;

    // Out of bounds
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
      this.alive = false;
      return;
    }

    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;
    const col = Math.floor(cx / TILE);
    const row = Math.floor(cy / TILE);

    // Wall collision
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      const tile = game.map[row][col];
      if (tile === BRICK) {
        const destroyed = damageBrick(row, col, this.dir);
        this.alive = false;
        game.explosions.push(new Explosion(col * TILE + TILE / 2, row * TILE + TILE / 2, destroyed));
        soundHit();
        if (destroyed && Math.random() < FRUIT_DROP_CHANCE * 0.4) {
          spawnFruit();
        }
        return;
      }
      // Glass barriers stop normal bullets. Level-3 player bullets break them.
      if (tile === STEEL || tile === GLASS) {
        if (this.penetrateGlass) {
          game.map[row][col] = EMPTY;
          game.explosions.push(new Explosion(col * TILE + TILE / 2, row * TILE + TILE / 2, false));
          soundHit();
        } else {
          this.alive = false;
          game.explosions.push(new Explosion(col * TILE + TILE / 2, row * TILE + TILE / 2, false));
          soundHit();
          return;
        }
      }
      // Grass — bullet passes through (handled implicitly)
    }

    // Check base collision — only player bullets can destroy the base
    if (game.baseAlive && this.owner === game.player) {
      const b = { x: BASE_X, y: BASE_Y, w: BASE_W, h: BASE_H };
      if (rectOverlap({ x: this.x, y: this.y, w: this.size, h: this.size }, b)) {
        this.alive = false;
        game.baseAlive = false;
        game.explosions.push(new Explosion(BASE_X + BASE_W / 2, BASE_Y + BASE_H / 2, true));
        soundExplode();
        return;
      }
    }

    // Enemy bullet hitting the base — destroy bullet, base survives
    if (game.baseAlive && this.owner !== game.player) {
      const b = { x: BASE_X, y: BASE_Y, w: BASE_W, h: BASE_H };
      if (rectOverlap({ x: this.x, y: this.y, w: this.size, h: this.size }, b)) {
        this.alive = false;
        game.explosions.push(new Explosion(this.x + this.size / 2, this.y + this.size / 2, false));
        soundHit();
        return;
      }
    }

    // Check hits on tanks
    const bulletBox = { x: this.x, y: this.y, w: this.size, h: this.size };

    // Player bullet → enemy
    if (this.owner === game.player) {
      for (let i = game.enemiesAlive.length - 1; i >= 0; i--) {
        const enemy = game.enemiesAlive[i];
        if (!enemy.alive) continue;
        if (rectOverlap(bulletBox, { x: enemy.x, y: enemy.y, w: TANK_SIZE, h: TANK_SIZE })) {
          this.alive = false;
          enemy.alive = false;
          game.score += enemy.points || 100;
          game.enemiesKilled++;
          game.explosions.push(new Explosion(enemy.x + HALF_TANK, enemy.y + HALF_TANK, true));
          soundExplode();
          if (Math.random() < FRUIT_DROP_CHANCE) {
            spawnFruit();
          }
          updateHUD();
          return;
        }
      }
    }

    // Enemy bullet → player
    if (this.owner !== game.player) {
      if (game.player && game.player.alive) {
        if (rectOverlap(bulletBox, { x: game.player.x, y: game.player.y, w: TANK_SIZE, h: TANK_SIZE })) {
          this.alive = false;
          if (game.player.invincible) {
            // Bullet is blocked by invincibility shield
            game.explosions.push(new Explosion(this.x + this.size / 2, this.y + this.size / 2, false));
            soundHit();
          } else {
            game.player.alive = false;
            game.explosions.push(new Explosion(game.player.x + HALF_TANK, game.player.y + HALF_TANK, true));
            soundExplode();
          }
          updateHUD();
        }
      }
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    const bulletDrawSize = 12;
    if (drawImageAsset(
      ctx,
      IMAGE_PATHS.bullets[this.dir],
      this.x + this.size / 2 - bulletDrawSize / 2,
      this.y + this.size / 2 - bulletDrawSize / 2,
      bulletDrawSize,
      bulletDrawSize
    )) return;

    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 6;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.shadowBlur = 0;
  }
}


// -------------------- Tank --------------------
class Tank {
  constructor(x, y, dir, isPlayer = false) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.isPlayer = isPlayer;
    this.alive = true;
    this.speed = isPlayer ? 2.2 : 1.2;
    this.cooldown = 0;
    this.maxCooldown = isPlayer ? 15 : 40;
    this.points = 100;

    this.aiTimer = rand(60, 180);
    this.aiShootTimer = rand(30, 90);
    this.invincible = false;
    this.invincibleTimer = 0;
    this.moveDir = dir;
    this.level = isPlayer ? 1 : 0;
    if (isPlayer) this.applyLevelStats();
  }

  applyLevelStats() {
    switch (this.level) {
      case 1: this.maxCooldown = 15; break;
      case 2: this.maxCooldown = 10; break;
      case 3: this.maxCooldown = 6; break;
    }
  }

  get cx() { return this.x + HALF_TANK; }
  get cy() { return this.y + HALF_TANK; }

  canMoveTo(nx, ny) {
    // Bounds check
    if (nx < 0 || nx + TANK_SIZE > W || ny < 0 || ny + TANK_SIZE > H) return false;

    // Wall collision — only impassable tiles block movement
    const corners = [
      [nx, ny],
      [nx + TANK_SIZE - 1, ny],
      [nx, ny + TANK_SIZE - 1],
      [nx + TANK_SIZE - 1, ny + TANK_SIZE - 1],
    ];
    for (const [cx, cy] of corners) {
      const col = Math.floor(cx / TILE);
      const row = Math.floor(cy / TILE);
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      const tile = game.map[row][col];
      if (!PASSABLE_TILES.has(tile)) return false;
    }

    // Base area — can't drive over the flag
    if (game.baseAlive) {
      if (rectOverlap({ x: nx, y: ny, w: TANK_SIZE, h: TANK_SIZE },
                       { x: BASE_X, y: BASE_Y, w: BASE_W, h: BASE_H })) return false;
    }

    // Other tank collision
    const myBox = { x: nx, y: ny, w: TANK_SIZE, h: TANK_SIZE };
    if (this.isPlayer) {
      for (const enemy of game.enemiesAlive) {
        if (!enemy.alive) continue;
        if (rectOverlap(myBox, { x: enemy.x, y: enemy.y, w: TANK_SIZE, h: TANK_SIZE })) return false;
      }
    } else {
      if (game.player && game.player.alive) {
        if (rectOverlap(myBox, { x: game.player.x, y: game.player.y, w: TANK_SIZE, h: TANK_SIZE })) return false;
      }
      for (const other of game.enemiesAlive) {
        if (other === this || !other.alive) continue;
        if (rectOverlap(myBox, { x: other.x, y: other.y, w: TANK_SIZE, h: TANK_SIZE })) return false;
      }
    }

    return true;
  }

  shoot() {
    if (this.cooldown > 0) return null;
    this.cooldown = this.maxCooldown;

    let bx = this.x + HALF_TANK - BULLET_SIZE / 2 + DX[this.dir] * HALF_TANK;
    let by = this.y + HALF_TANK - BULLET_SIZE / 2 + DY[this.dir] * HALF_TANK;
    bx = Math.max(0, Math.min(W - BULLET_SIZE, bx));
    by = Math.max(0, Math.min(H - BULLET_SIZE, by));

    const canPenetrate = this.isPlayer && this.level >= 3;
    const bullet = new Bullet(bx, by, this.dir, this, canPenetrate);
    if (this.isPlayer) soundShoot();
    return bullet;
  }

  update() {
    if (!this.alive) return;
    if (this.cooldown > 0) this.cooldown--;

    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    if (this.isPlayer) {
      this.updatePlayer();
    } else {
      this.updateAI();
    }
  }

  updatePlayer() {
    let newDir = this.dir;
    let wantMove = false;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) { newDir = DIR.UP; wantMove = true; }
    else if (keys['ArrowDown'] || keys['s'] || keys['S']) { newDir = DIR.DOWN; wantMove = true; }
    else if (keys['ArrowLeft'] || keys['a'] || keys['A']) { newDir = DIR.LEFT; wantMove = true; }
    else if (keys['ArrowRight'] || keys['d'] || keys['D']) { newDir = DIR.RIGHT; wantMove = true; }

    if (wantMove) {
      this.dir = newDir;
      const nx = this.x + DX[this.dir] * this.speed;
      const ny = this.y + DY[this.dir] * this.speed;

      // Grid alignment for smooth cornering
      if (DX[this.dir] !== 0) {
        const alignedY = Math.round(this.y / TILE) * TILE + (TILE - TANK_SIZE) / 2;
        const dy = alignedY - this.y;
        if (Math.abs(dy) > 0.5 && this.canMoveTo(this.x, this.y + Math.sign(dy) * 0.5)) {
          this.y += Math.sign(dy) * 0.5;
        }
      } else if (DY[this.dir] !== 0) {
        const alignedX = Math.round(this.x / TILE) * TILE + (TILE - TANK_SIZE) / 2;
        const dx = alignedX - this.x;
        if (Math.abs(dx) > 0.5 && this.canMoveTo(this.x + Math.sign(dx) * 0.5, this.y)) {
          this.x += Math.sign(dx) * 0.5;
        }
      }

      if (this.canMoveTo(nx, ny)) {
        this.x = nx;
        this.y = ny;
        soundMove();
      }
    }

    const shootPressed = keys[' '] || keys['Space'] || keys['j'] || keys['J'];
    if (shootPressed) {
      const bullet = this.shoot();
      if (bullet) game.bullets.push(bullet);
    }
  }

  updateAI() {
    this.aiTimer--;
    this.aiShootTimer--;

    if (this.aiTimer <= 0) {
      this.aiTimer = rand(60, 180);
      // Reduced chase probability for more random movement
      if (Math.random() < 0.18 && game.player && game.player.alive) {
        // Avoid heading directly toward the base area
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        // Bias away from heading straight down toward the base
        if (Math.abs(dx) > Math.abs(dy) || this.y > BASE_Y - TILE * 4) {
          this.moveDir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
        } else {
          this.moveDir = dy > 0 ? DIR.DOWN : DIR.UP;
        }
      } else {
        // Favor horizontal / upward movement to reduce base-directed fire
        const roll = Math.random();
        if (this.y > BASE_Y - TILE * 6 && roll < 0.45) {
          this.moveDir = rand(0, 1) === 0 ? DIR.LEFT : DIR.RIGHT;
        } else {
          this.moveDir = rand(0, 3);
        }
      }
    }

    this.dir = this.moveDir;
    const nx = this.x + DX[this.dir] * this.speed;
    const ny = this.y + DY[this.dir] * this.speed;

    if (this.canMoveTo(nx, ny)) {
      this.x = nx;
      this.y = ny;
    } else {
      this.aiTimer = 0;
    }

    if (this.aiShootTimer <= 0) {
      this.aiShootTimer = rand(35, 100);
      // Reduce chance of shooting directly toward the base
      const facingBase = this.dir === DIR.DOWN && this.y > BASE_Y - TILE * 7;
      const shootChance = facingBase ? 0.4 : 1.0;
      if (Math.random() < shootChance) {
        const bullet = this.shoot();
        if (bullet) game.bullets.push(bullet);
      }
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    if (this.invincible && Math.floor(game.frame / 4) % 2 === 0) return;

    const x = this.x, y = this.y;
    const s = TANK_SIZE;
    const cx = x + s / 2, cy = y + s / 2;

    if (this.isPlayer) {
      const drewPlayer = drawImageAsset(ctx, IMAGE_PATHS.player[this.dir], x, y, s, s);
      if (drewPlayer) {
        if (this.level >= 2) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px "Courier New", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('*'.repeat(this.level - 1), cx, y + s + 1);
        }
        return;
      }
    } else {
      const enemySprite = this.points > 100 ? IMAGE_PATHS.enemyFast : IMAGE_PATHS.enemyNormal;
      if (drawRotatedImageAsset(ctx, enemySprite, x - 2, y - 2, s + 4, s + 4, this.dir)) return;
    }

    if (this.isPlayer) {
      // ===== PLAYER (Gold) =====
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(x, y + 2, 5, s - 4);
      ctx.fillRect(x + s - 5, y + 2, 5, s - 4);
      ctx.fillStyle = '#6B4F10';
      for (let i = 0; i < 5; i++) {
        const ty = y + 4 + i * 5;
        ctx.fillRect(x, ty, 5, 2);
        ctx.fillRect(x + s - 5, ty, 5, 2);
      }
      const grad = ctx.createLinearGradient(x, y, x + s, y + s);
      grad.addColorStop(0, '#FFD700');
      grad.addColorStop(0.5, '#FFC125');
      grad.addColorStop(1, '#DAA520');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 4, y + 3, s - 8, s - 6);
      ctx.fillStyle = 'rgba(255,255,200,0.2)';
      ctx.fillRect(x + 6, y + 5, s - 16, 4);
      ctx.fillStyle = '#B8860B';
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#DAA520';
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
      // Level indicator stars
      if (this.level >= 2) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('★'.repeat(this.level - 1), cx, y + s + 1);
      }
      ctx.fillStyle = '#8B6914';
      const bw = 4, bh = 12;
      switch (this.dir) {
        case DIR.UP:    ctx.fillRect(cx - bw/2, y - 2, bw, bh); break;
        case DIR.DOWN:  ctx.fillRect(cx - bw/2, y + s - bh + 2, bw, bh); break;
        case DIR.LEFT:  ctx.fillRect(x - 2, cy - bw/2, bh, bw); break;
        case DIR.RIGHT: ctx.fillRect(x + s - bh + 2, cy - bw/2, bh, bw); break;
      }
    } else {
      // ===== ENEMY (Red / Green for fast) =====
      const color = this.points > 100 ? '#2ECC71' : '#E74C3C';
      const dark  = this.points > 100 ? '#1A7A42' : '#922B21';
      const light = this.points > 100 ? '#58D68D' : '#F1948A';
      ctx.fillStyle = dark;
      ctx.fillRect(x, y + 2, 5, s - 4);
      ctx.fillRect(x + s - 5, y + 2, 5, s - 4);
      ctx.fillStyle = color;
      ctx.fillRect(x + 4, y + 3, s - 8, s - 6);
      ctx.fillStyle = light;
      ctx.fillRect(x + 7, y + 7, s - 14, 3);
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dark;
      const bw = 3, bh = 10;
      switch (this.dir) {
        case DIR.UP:    ctx.fillRect(cx - bw/2, y - 1, bw, bh); break;
        case DIR.DOWN:  ctx.fillRect(cx - bw/2, y + s - bh + 1, bw, bh); break;
        case DIR.LEFT:  ctx.fillRect(x - 1, cy - bw/2, bh, bw); break;
        case DIR.RIGHT: ctx.fillRect(x + s - bh + 1, cy - bw/2, bh, bw); break;
      }
    }
  }
}
