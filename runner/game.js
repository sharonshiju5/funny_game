import { GameLoop } from './engine/GameLoop.js';
import { Physics } from './engine/Physics.js';
import { Collision } from './engine/Collision.js';
import { Input } from './engine/Input.js';
import { Player } from './entities/Player.js';
import { Obstacle } from './entities/Obstacle.js';
import { Coin } from './entities/Coin.js';
import { Booster } from './entities/Booster.js';
import { Camera } from './engine/Camera.js';
import { Storage } from './engine/Storage.js';
import { ObjectPool } from './engine/ObjectPool.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        
        this.state = 'MENU';
        this.score = 0;
        this.gameSpeed = 1;
        this.difficulty = 1;
        
        this.player = new Player(100, Physics.GROUND_Y);
        this.obstacles = [];
        this.coins = [];
        this.boosters = [];
        this.particles = [];
        
        this.spawnTimer = 0;
        this.coinTimer = 0;
        this.boosterTimer = 0;
        this.difficultyTimer = 0;
        
        this.bgLayers = [
            { x: 0, speed: 0.2, color: '#4A90E2' },
            { x: 0, speed: 0.5, color: '#5BA3F5' },
            { x: 0, speed: 1, color: '#6CB6FF' }
        ];
        
        this.activeBooster = null;
        this.boosterTime = 0;
        this.shieldActive = false;
        this.magnetActive = false;
        
        this.gameLoop = new GameLoop();
        this.input = new Input();
        this.camera = new Camera();
        
        this.particlePool = new ObjectPool(
            () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '' }),
            (p, x, y, color) => {
                p.x = x;
                p.y = y;
                p.vx = (Math.random() - 0.5) * 5;
                p.vy = (Math.random() - 0.5) * 5;
                p.life = 1;
                p.color = color;
            }
        );
        
        this.audioCtx = null;
        this.sounds = {};
        this.muted = Storage.getMuteState();
        this.updateMuteButton();
        
        this.setupUI();
        this.setupInput();
    }

    setupUI() {
        document.getElementById('startBtn').onclick = () => this.startGame();
        document.getElementById('retryBtn').onclick = () => this.startGame();
        document.getElementById('pauseBtn').onclick = () => this.pauseGame();
        document.getElementById('resumeBtn').onclick = () => this.resumeGame();
        document.getElementById('menuBtn').onclick = () => this.showMenu();
        document.getElementById('menuBtn2').onclick = () => this.showMenu();
        document.getElementById('muteBtn').onclick = () => this.toggleMute();
        
        document.getElementById('jumpBtn').ontouchstart = (e) => {
            e.preventDefault();
            this.handleJump();
        };
        
        document.getElementById('slideBtn').ontouchstart = (e) => {
            e.preventDefault();
            this.handleSlide();
        };
    }

    setupInput() {
        this.input.onSwipe(
            () => this.handleJump(),
            () => this.handleSlide()
        );
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSound(freq, duration = 0.1) {
        if (this.muted || !this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    toggleMute() {
        this.muted = !this.muted;
        Storage.saveMuteState(this.muted);
        this.updateMuteButton();
    }
    
    updateMuteButton() {
        document.getElementById('muteBtn').textContent = this.muted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
    }

    handleJump() {
        if (this.state === 'PLAYING' && this.player.jump()) {
            this.playSound(440, 0.1);
        }
    }

    handleSlide() {
        if (this.state === 'PLAYING' && this.player.slide()) {
            this.playSound(220, 0.15);
        }
    }

    startGame() {
        this.initAudio();
        this.state = 'PLAYING';
        document.getElementById('high-score').textContent = `HIGH SCORE: ${Storage.getHighScore()}`;
        this.score = 0;
        this.gameSpeed = 1;
        this.difficulty = 1;
        this.player = new Player(100, Physics.GROUND_Y);
        this.obstacles = [];
        this.coins = [];
        this.boosters = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.coinTimer = 0;
        this.boosterTimer = 0;
        this.activeBooster = null;
        this.shieldActive = false;
        this.magnetActive = false;
        
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('hud').style.display = 'flex';
        
        this.gameLoop.start(
            (dt) => this.update(dt),
            () => this.render()
        );
    }

    pauseGame() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.gameLoop.stop();
            document.getElementById('pause-screen').classList.remove('hidden');
        }
    }

    resumeGame() {
        this.state = 'PLAYING';
        document.getElementById('pause-screen').classList.add('hidden');
        this.gameLoop.start(
            (dt) => this.update(dt),
            () => this.render()
        );
    }

    showMenu() {
        this.state = 'MENU';
        this.gameLoop.stop();
        document.getElementById('menu').classList.remove('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('hud').style.display = 'none';
    }

    gameOver() {
        this.state = 'GAME_OVER';
        this.player.state = 'DEAD';
        this.camera.shake(20, 0.5);
        this.playSound(100, 0.5);
        
        const isNewRecord = Storage.saveHighScore(this.score);
        
        setTimeout(() => {
            document.getElementById('final-score').textContent = `Score: ${this.score}`;
            if (isNewRecord) {
                document.getElementById('new-record').classList.remove('hidden');
            } else {
                document.getElementById('new-record').classList.add('hidden');
            }
            document.getElementById('gameover-screen').classList.remove('hidden');
        }, 500);
    }

    update(deltaTime) {
        if (this.state !== 'PLAYING') return;

        if (this.input.isPressed('arrowup') || this.input.isPressed('w') || this.input.isPressed(' ')) {
            this.handleJump();
        }
        if (this.input.isPressed('arrowdown') || this.input.isPressed('s')) {
            this.handleSlide();
        }

        const flying = this.activeBooster === 'fly';
        this.player.update(deltaTime, flying, this.gameSpeed);
        
        if (this.player.shouldEmitDust()) {
            this.createParticles(this.player.x, this.player.y + this.player.height, '#8B4513', 3);
        }
        
        if (!flying) {
            Physics.applyGravity(this.player, deltaTime);
        }

        this.difficultyTimer += deltaTime;
        if (this.difficultyTimer > 10) {
            this.difficulty += 0.1;
            this.gameSpeed = Math.min(2, 1 + this.difficulty * 0.1);
            this.difficultyTimer = 0;
        }

        this.camera.update(deltaTime);
        this.updateBackground(deltaTime);
        this.spawnEntities(deltaTime);
        this.updateEntities(deltaTime);
        this.checkCollisions();
        this.updateBoosters(deltaTime);
        this.updateParticles(deltaTime);
        
        this.score += Math.floor(deltaTime * 10 * this.gameSpeed);
        document.getElementById('score').textContent = this.score;
    }

    updateBackground(deltaTime) {
        this.bgLayers.forEach(layer => {
            layer.x -= layer.speed * this.gameSpeed * deltaTime * 100;
            if (layer.x <= -this.canvas.width) {
                layer.x = 0;
            }
        });
    }

    spawnEntities(deltaTime) {
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            const types = ['ground', 'spike', 'floating', 'moving'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.obstacles.push(new Obstacle(this.canvas.width, 0, type));
            this.spawnTimer = Math.max(0.8, 2 - this.difficulty * 0.1);
        }

        this.coinTimer -= deltaTime;
        if (this.coinTimer <= 0) {
            this.coins.push(new Coin(this.canvas.width));
            this.coinTimer = Math.random() * 2 + 1;
        }

        this.boosterTimer -= deltaTime;
        if (this.boosterTimer <= 0) {
            const types = ['speed', 'fly', 'shield', 'magnet'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.boosters.push(new Booster(this.canvas.width, 250, type));
            this.boosterTimer = Math.random() * 15 + 10;
        }
    }

    updateEntities(deltaTime) {
        this.obstacles = this.obstacles.filter(obs => {
            obs.update(deltaTime, this.gameSpeed);
            return !obs.isOffScreen();
        });

        this.coins = this.coins.filter(coin => {
            coin.update(deltaTime, this.gameSpeed);
            
            if (this.magnetActive && !coin.collected) {
                const dx = this.player.x - coin.x;
                const dy = this.player.y - coin.y;
                coin.x += dx * deltaTime * 5;
                coin.y += dy * deltaTime * 5;
            }
            
            return !coin.isOffScreen();
        });

        this.boosters = this.boosters.filter(booster => {
            booster.update(deltaTime, this.gameSpeed);
            return !booster.isOffScreen();
        });
    }

    checkCollisions() {
        this.obstacles.forEach(obs => {
            if (Collision.checkAABB(this.player, obs)) {
                if (this.shieldActive) {
                    this.shieldActive = false;
                    this.activeBooster = null;
                    this.camera.shake(10, 0.2);
                    this.playSound(600, 0.2);
                    this.createParticles(obs.x, obs.y, '#00FF00', 15);
                } else {
                    this.gameOver();
                }
            }
        });

        this.coins.forEach(coin => {
            if (!coin.collected && Collision.checkCircle(this.player, coin)) {
                coin.collected = true;
                this.score += 10;
                this.playSound(880, 0.1);
                this.createParticles(coin.x, coin.y, '#FFD700', 8);
            }
        });

        this.boosters.forEach(booster => {
            if (!booster.collected && Collision.checkAABB(this.player, booster)) {
                booster.collected = true;
                this.activateBooster(booster.type);
                this.playSound(1200, 0.15);
            }
        });
    }

    activateBooster(type) {
        this.activeBooster = type;
        this.boosterTime = 5;
        
        if (type === 'shield') this.shieldActive = true;
        if (type === 'magnet') this.magnetActive = true;
        if (type === 'speed') this.gameSpeed *= 1.5;
    }

    updateBoosters(deltaTime) {
        if (this.activeBooster) {
            this.boosterTime -= deltaTime;
            
            const indicator = document.getElementById('booster-indicator');
            indicator.textContent = `${this.activeBooster.toUpperCase()}: ${Math.ceil(this.boosterTime)}s`;
            
            if (this.boosterTime <= 0) {
                if (this.activeBooster === 'speed') this.gameSpeed /= 1.5;
                this.activeBooster = null;
                this.shieldActive = false;
                this.magnetActive = false;
                indicator.textContent = '';
            }
        }
    }

    createParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            this.particles.push(this.particlePool.get(x, y, color));
        }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= deltaTime * 2;
            if (p.life <= 0) {
                this.particlePool.release(p);
                return false;
            }
            return true;
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.camera.apply(this.ctx);
        
        this.bgLayers.forEach((layer, i) => {
            this.ctx.fillStyle = layer.color;
            this.ctx.fillRect(layer.x, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillRect(layer.x + this.canvas.width, 0, this.canvas.width, this.canvas.height);
        });

        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 460, this.canvas.width, 140);

        this.obstacles.forEach(obs => obs.render(this.ctx));
        this.coins.forEach(coin => coin.render(this.ctx));
        this.boosters.forEach(booster => booster.render(this.ctx));
        
        if (this.shieldActive) {
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.player.x - 5, this.player.y - 5, this.player.width + 10, this.player.height + 10);
        }
        
        this.player.render(this.ctx);
        
        this.player.render(this.ctx, this.gameSpeed);
        
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fillRect(p.x, p.y, 5, 5);
        });
        this.ctx.globalAlpha = 1;
        
        this.camera.reset(this.ctx);
        this.ctx.restore();
    }
}

const game = new Game();
