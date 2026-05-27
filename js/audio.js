// ============================================================
//  AUDIO - sound effects from tank-game/audio with beep fallback
// ============================================================
let audioCtx = null;
let backgroundMusic = null;
let lastMoveSoundAt = 0;

const SOUND_PATHS = {
  shoot: 'audio/tank_fire.wav',
  move: 'audio/tank_move.wav',
  explode: 'audio/explode.wav',
  music: 'audio/war1.wav',
};

const AUDIO_CACHE = new Map();

function getAudio(name) {
  const src = SOUND_PATHS[name];
  if (!src) return null;
  if (!AUDIO_CACHE.has(name)) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    AUDIO_CACHE.set(name, audio);
  }
  return AUDIO_CACHE.get(name);
}

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  Object.keys(SOUND_PATHS).forEach(getAudio);
}

function playBeep(freq, duration, type = 'square', vol = 0.08) {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) { /* silent fail */ }
}

function playAssetSound(name, volume, fallback) {
  const source = getAudio(name);
  if (!source) {
    if (fallback) fallback();
    return;
  }

  try {
    const audio = source.cloneNode(true);
    audio.volume = volume;
    audio.currentTime = 0;
    const played = audio.play();
    if (played && typeof played.catch === 'function') {
      played.catch(() => { if (fallback) fallback(); });
    }
  } catch (e) {
    if (fallback) fallback();
  }
}

function startBackgroundMusic() {
  const source = getAudio('music');
  if (!source) return;

  try {
    if (!backgroundMusic) {
      backgroundMusic = source.cloneNode(true);
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.18;
    }
    const played = backgroundMusic.play();
    if (played && typeof played.catch === 'function') played.catch(() => {});
  } catch (e) { /* silent fail */ }
}

function stopBackgroundMusic() {
  if (!backgroundMusic) return;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}

function soundShoot() {
  playAssetSound('shoot', 0.35, () => playBeep(800, 0.08, 'square', 0.05));
}

function soundMove() {
  const now = performance.now();
  if (now - lastMoveSoundAt < 170) return;
  lastMoveSoundAt = now;
  playAssetSound('move', 0.22, null);
}

function soundPickup() {
  playBeep(660, 0.1, 'sine', 0.08);
  playBeep(880, 0.12, 'sine', 0.06);
}

function soundHit() {
  playAssetSound('explode', 0.2, () => playBeep(300, 0.15, 'sawtooth', 0.08));
}

function soundExplode() {
  playAssetSound('explode', 0.5, () => {
    playBeep(120, 0.3, 'sawtooth', 0.1);
    playBeep(80, 0.4, 'square', 0.06);
  });
}

function soundGameOver() {
  stopBackgroundMusic();
  playBeep(200, 0.5, 'square', 0.08);
  setTimeout(() => playBeep(150, 0.6, 'square', 0.06), 300);
}
