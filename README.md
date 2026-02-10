# 🎮 Ball Eater Game

Professional 2D arcade game with sound-reactive visuals, AI patterns, and mobile controls.

## 🚀 Features

### Core Gameplay
- ✅ Delta-time physics (frame-rate independent)
- ✅ State machine architecture (idle/eating/dead)
- ✅ Circle collision detection
- ✅ Progressive difficulty scaling
- ✅ Combo multiplier system

### AI & Patterns
- **Straight Drop**: Basic falling balls
- **Zig-Zag**: Sine wave movement
- **Homing**: Tracks player (appears at higher scores)

### Power-ups
- 🛡️ **Shield**: Survive one bad hit (5s duration)
- ⚡ **Speed**: 1.5x movement speed
- 🧲 **Magnet**: Pulls good balls toward player (5s)

### Sound-Reactive Visuals
- 🔊 Web Audio API integration
- Real-time frequency analysis
- Audio-driven particle explosions
- Pulse effects on eating
- Dynamic screen shake intensity
- Shield glow reacts to audio energy

### Controls
- **Desktop**: Arrow keys / WASD
- **Mobile**: Touch buttons (bottom-right)
- **Both**: Simultaneous keyboard + touch support

## 📁 Project Structure

```
game/
├── index.html          # Main game container
├── style.css           # UI & mobile controls
├── game.js             # Complete game engine
└── assets/
    ├── sprites/        # Character & power-up sprites
    │   ├── generate_idle.html
    │   ├── generate_eat.html
    │   └── generate_powerups.html
    ├── backgrounds/    # Parallax background layers
    │   └── generate_bg.html
    └── sounds/         # Audio generator
        └── generate_sounds.html
```

## 🎨 Generate Assets

Open these HTML files in browser to generate PNG/WAV assets:

1. **Sprites**: `assets/sprites/generate_*.html`
2. **Backgrounds**: `assets/backgrounds/generate_bg.html`
3. **Sounds**: `assets/sounds/generate_sounds.html`

## 🎯 How to Play

1. Open `index.html` in browser
2. Eat green balls (+10 points, combo multiplier)
3. Avoid red balls (instant death unless shielded)
4. Collect power-ups for advantages
5. Survive as long as possible!

## 🧠 Technical Architecture

### Game Loop
- `requestAnimationFrame` for smooth 60 FPS
- Delta time for frame-rate independence
- Separated update/render logic

### Audio System
- AudioContext with AnalyserNode
- Real-time frequency data extraction
- Procedural sound generation
- Mobile-safe audio unlock

### Particle System
- Physics-based particles
- Audio-reactive velocity
- Color-coded feedback

### Performance
- Optimized collision detection
- Minimal DOM manipulation
- Canvas-only rendering
- Mobile-optimized (fftSize: 128)

## 🔧 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (requires user interaction for audio)
- Mobile: ✅ Touch controls + audio

## 📈 Future Enhancements

- Boss balls with phases
- High score persistence (localStorage)
- Leaderboard system
- Additional power-ups
- More AI patterns
- Background music with parallax

## 🎓 Learning Resources

This game demonstrates:
- Professional game architecture
- Web Audio API usage
- Canvas rendering optimization
- Mobile-first design
- State machine patterns
- Physics simulation
- Particle systems

Built with vanilla JavaScript - no frameworks needed!
