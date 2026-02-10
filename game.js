const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Input Systems
const keys = {};
const touchKeys = { up: false, down: false, left: false, right: false };

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Mobile Controls
document.querySelectorAll('#controls button').forEach(btn => {
  const dir = btn.dataset.dir;
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    touchKeys[dir] = true;
  });
  btn.addEventListener('touchend', e => {
    e.preventDefault();
    touchKeys[dir] = false;
  });
  btn.addEventListener('mousedown', () => touchKeys[dir] = true);
  btn.addEventListener('mouseup', () => touchKeys[dir] = false);
});

// Game State
let player, balls, powerUps, score, spawnTimer, spawnInterval, gameRunning, shakeTime, combo;

function initGame() {
  player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    speed: 250,
    speedMultiplier: 1,
    state: 'idle',
    eatTimer: 0,
    shield: false,
    shieldTime: 0,
    magnet: false,
    magnetTime: 0,
    frameIndex: 0,
    frameTimer: 0
  };
  
  balls = [];
  powerUps = [];
  score = 0;
  combo = 0;
  spawnTimer = 0;
  spawnInterval = 1.0;
  gameRunning = true;
  shakeTime = 0;
  
  gameOverEl.classList.add('hidden');
  scoreEl.textContent = 'Score: 0';
}

// Ball AI Patterns
function spawnBall() {
  const isGood = Math.random() > 0.35;
  const patterns = ['straight', 'zigzag', 'homing'];
  const pattern = patterns[Math.min(Math.floor(score / 100), 2)];
  
  balls.push({
    x: Math.random() * (canvas.width - 40) + 20,
    y: -20,
    vx: 0,
    vy: 0,
    radius: 15,
    speed: 100 + Math.random() * 80,
    type: isGood ? 'good' : 'bad',
    color: isGood ? '#4ecdc4' : '#ff6b6b',
    pattern: Math.random() < 0.7 ? 'straight' : pattern,
    time: 0
  });
}

// Power-up Spawning
function spawnPowerUp() {
  if (powerUps.length > 0 || Math.random() > 0.15) return;
  
  const types = ['shield', 'speed', 'magnet'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  powerUps.push({
    x: Math.random() * (canvas.width - 40) + 20,
    y: -20,
    radius: 12,
    speed: 80,
    type,
    color: type === 'shield' ? '#4ecdc4' : type === 'speed' ? '#ff6b6b' : '#9b59b6'
  });
}

// Collision Detection
function collision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

// Update Logic
function update(deltaTime) {
  if (!gameRunning) return;
  
  // Input → Velocity (keyboard + touch)
  const velocityX = (
    ((keys['ArrowRight'] || keys['d'] || touchKeys.right) ? 1 : 0) - 
    ((keys['ArrowLeft'] || keys['a'] || touchKeys.left) ? 1 : 0)
  );
  const velocityY = (
    ((keys['ArrowDown'] || keys['s'] || touchKeys.down) ? 1 : 0) - 
    ((keys['ArrowUp'] || keys['w'] || touchKeys.up) ? 1 : 0)
  );
  
  // Player Movement
  player.x += velocityX * player.speed * player.speedMultiplier * deltaTime;
  player.y += velocityY * player.speed * player.speedMultiplier * deltaTime;
  
  // Screen Boundaries
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
  
  // Animation
  player.frameTimer += deltaTime;
  if (player.frameTimer > 0.15) {
    player.frameIndex = (player.frameIndex + 1) % 3;
    player.frameTimer = 0;
  }
  
  // State Timers
  if (player.state === 'eating') {
    player.eatTimer -= deltaTime;
    if (player.eatTimer <= 0) player.state = 'idle';
  }
  
  if (player.shield) {
    player.shieldTime -= deltaTime;
    if (player.shieldTime <= 0) player.shield = false;
  }
  
  if (player.speedMultiplier > 1) {
    player.speedMultiplier = Math.max(1, player.speedMultiplier - deltaTime * 0.2);
  }
  
  if (player.magnet) {
    player.magnetTime -= deltaTime;
    if (player.magnetTime <= 0) player.magnet = false;
  }
  
  // Ball Spawning
  spawnTimer += deltaTime;
  if (spawnTimer >= spawnInterval) {
    spawnBall();
    spawnPowerUp();
    spawnTimer = 0;
    spawnInterval = Math.max(0.4, spawnInterval * 0.985);
  }
  
  // Ball Movement & AI
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    ball.time += deltaTime;
    
    // AI Patterns
    if (ball.pattern === 'straight') {
      ball.vx = 0;
      ball.vy = ball.speed;
    } else if (ball.pattern === 'zigzag') {
      ball.vx = Math.sin(ball.time * 4) * 80;
      ball.vy = ball.speed;
    } else if (ball.pattern === 'homing') {
      const dx = player.x - ball.x;
      const dy = player.y - ball.y;
      const angle = Math.atan2(dy, dx);
      ball.vx += Math.cos(angle) * 30 * deltaTime;
      ball.vy += Math.sin(angle) * 30 * deltaTime;
      const maxSpeed = 180;
      const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (currentSpeed > maxSpeed) {
        ball.vx = (ball.vx / currentSpeed) * maxSpeed;
        ball.vy = (ball.vy / currentSpeed) * maxSpeed;
      }
    }
    
    // Magnet Effect
    if (player.magnet && ball.type === 'good') {
      const dx = player.x - ball.x;
      const dy = player.y - ball.y;
      ball.vx += dx * 0.5 * deltaTime;
      ball.vy += dy * 0.5 * deltaTime;
    }
    
    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;
    
    // Remove off-screen
    if (ball.y > canvas.height + 50) {
      balls.splice(i, 1);
      combo = 0;
      continue;
    }
    
    // Collision with Player
    if (collision(player, ball)) {
      if (ball.type === 'good') {
        player.state = 'eating';
        player.eatTimer = 0.15;
        combo++;
        score += 10 * combo;
        scoreEl.textContent = `Score: ${score}${combo > 1 ? ' x' + combo : ''}`;
        balls.splice(i, 1);
      } else {
        if (player.shield) {
          player.shield = false;
          balls.splice(i, 1);
          shakeTime = 0.2;
        } else {
          gameRunning = false;
          shakeTime = 0.5;
          gameOverEl.classList.remove('hidden');
          finalScoreEl.textContent = score;
        }
      }
    }
  }
  
  // Power-up Movement
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.y += powerUp.speed * deltaTime;
    
    if (powerUp.y > canvas.height + 50) {
      powerUps.splice(i, 1);
      continue;
    }
    
    if (collision(player, powerUp)) {
      if (powerUp.type === 'shield') {
        player.shield = true;
        player.shieldTime = 5;
      } else if (powerUp.type === 'speed') {
        player.speedMultiplier = 1.5;
      } else if (powerUp.type === 'magnet') {
        player.magnet = true;
        player.magnetTime = 5;
      }
      powerUps.splice(i, 1);
    }
  }
  
  // Screen Shake
  if (shakeTime > 0) {
    shakeTime -= deltaTime;
  }
}

// Rendering Engine
function draw() {
  ctx.save();
  
  // Screen Shake
  if (shakeTime > 0) {
    const intensity = 8;
    ctx.translate(
      (Math.random() - 0.5) * intensity,
      (Math.random() - 0.5) * intensity
    );
  }
  
  // Clear Screen
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw Player
  const scale = player.state === 'eating' ? 1.1 : 1;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(scale, scale);
  
  // Body
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.state === 'eating' ? '#ffd93d' : '#6bcf7f';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Face
  if (player.state === 'eating') {
    const mouthOpen = 0.4 + Math.sin(player.eatTimer * 20) * 0.2;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(0, 0, player.radius * 0.7, mouthOpen * Math.PI, (2 - mouthOpen) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();
  } else {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(-8, -5, 3, 0, Math.PI * 2);
    ctx.arc(8, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 5, 10, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  ctx.restore();
  
  // Shield Effect
  if (player.shield) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  // Magnet Effect
  if (player.magnet) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 15, 0, Math.PI * 2);
    ctx.strokeStyle = '#9b59b6';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  
  // Draw Balls
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Pattern indicator
    if (ball.pattern === 'homing') {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(player.x, player.y);
      ctx.stroke();
    }
  });
  
  // Draw Power-ups
  powerUps.forEach(powerUp => {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.rotate(Date.now() / 500);
    
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
    ctx.fillStyle = powerUp.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = powerUp.type === 'shield' ? 'S' : powerUp.type === 'speed' ? '⚡' : 'M';
    ctx.fillText(icon, 0, 0);
    
    ctx.restore();
  });
  
  ctx.restore();
}

// Game Loop
let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;
  
  update(deltaTime);
  draw();
  
  requestAnimationFrame(gameLoop);
}

// Restart
restartBtn.addEventListener('click', initGame);

// Start Game
initGame();
requestAnimationFrame(gameLoop);
