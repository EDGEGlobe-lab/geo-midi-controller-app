# GEO MIDI Controller App

<div align="center">
  <img src="./logo.svg" alt="GEO MIDI Controller App - Neon Green Blueberry Logo" width="200" height="200" />
  <p><em>🌊 A browser-native control room for the GEO electronic music system powered by Lucid Dream AI 🌊</em></p>
</div>

A standalone deployable audio controller deck with bundled playback, transport controls, visual meters, and advanced multi-track mixing channels for the GEO electronic music system. Experience the **Auto-Lucid Dream World Motion AI** — inspired by the underwater magic of Finding Nemo.

**Built with [Manus](https://manus.build)** — a modern full-stack framework combining React, Express, TypeScript, and Drizzle ORM.

## 🧠 AI-Powered Lucid Dream Motion Intelligence

The logo isn't static — it's alive! Our **Auto-Lucid Dream World Motion AI** creates an immersive, dreamlike experience powered by intelligent mood detection and real-time animation.

### 🌈 Five Emotional Moods
- **Discovery** 🟢 — Neon green exploration mode with gentle scaling
- **Adventure** 🌊 — Cyan action mode with 360° rotation
- **Calm** 🩵 — Sky blue peaceful mode with gentle sway
- **Playful** 💛 — Gold joyful mode with bouncy movements
- **Mysterious** 💜 — Magenta introspective mode with 180° flips

### 🌊 Underwater Dreamscape
- Real-time ocean wave simulation
- Bioluminescent bubble particles
- Water displacement effects
- Ocean current animations
- Finding Nemo inspired character floats:
  - 🐠 Clownfish dancing diagonally
  - 🐢 Sea turtle gliding smoothly
  - 🐙 Octopus spinning mysteriously

### ✨ Lucid Dream Enhancements
- Dream aura field pulsing around the neon green blueberry
- Autonomous eye movement & blinking
- Championship diamond animations (bobbing & bouncing)
- Celtic cross mouth responsive to mood
- Bioluminescent glow effects
- Real-time mood intensity indicator

### 🎮 Interactive Controls
- Manual mood selector buttons
- Lucid dream status display
- Dynamic color feedback
- Automatic 8-second mood cycling
- Smooth mood transitions

## 🏆 Championship Branding

The logo features:
- **Neon Green Blueberry** — Vibrant #39FF14 body with glossy shine
- **Sparkly Neon Blue Eyes** — Brilliant cyan (#00FFFF) with white sparkles
- **Celtic Cross Mouth** — WWE Championship inspired with neon magenta (#FF00FF)
- **Diamond Accents** — Gold (#FFD700) championship gems with brilliant sparkles
- **Chandra X-ray Observatory Background** — Deep space cosmic backdrop with nebula wisps, distant planets, and X-ray energy bursts

## Features

- 🎚️ **Professional Mixer Interface** — Multi-track channel strips with independent controls
- ⏯️ **Transport Controls** — Play, stop, and navigation with visual feedback
- 📊 **Visual Meters** — Real-time signal monitoring with animated meter capsules
- 🎵 **Audio Playback** — Integrated playback engine with track synchronization
- 🛠️ **MIDI Integration** — Native MIDI controller support
- 🌙 **Dark-Mode UI** — Neo-industrial Signal Laboratory design system with lucid dream enhancements
- 📱 **Responsive Layout** — Master bus-first layout optimized for studio workflows
- 🧠 **AI Motion Intelligence** — Auto-Lucid dream world animations

## Design System

The app implements the **Signal Laboratory** design direction with **Lucid Dream Ocean Intelligence** enhancements: a precision instrument panel with a contemporary neo-industrial aesthetic fused with underwater dreamscape environments.

### Visual Language

- **Base Color**: Near-black graphite surfaces for visual separation without heavy borders
- **Signal Cyan** (`#55E6FF`): Indicates active transport and live signals
- **Neon Green** (`#39FF14`): Primary branding and stable output
- **Amber**: Marks timing, tempo, and rhythmic cues
- **Magenta** (`#FF00FF`): Highlights effects and special parameters
- **Acid Green**: Indicates stable, healthy output

### Typography

- **Space Grotesk**: Display labels and primary interface headings
- **IBM Plex Mono**: Tempo, patch names, MIDI channels, and status readouts

### Interaction Model

- Short, crisp control responses with latched states
- Meter motion that breathes without distraction
- Animated transitions under 220ms
- Tactile feedback mimicking physical studio controls
- Mood-responsive animations based on AI detection

## Tech Stack

### Frontend
- **React 19** — UI framework
- **Vite** — Build tool and dev server
- **TypeScript** — Type-safe development
- **TailwindCSS 4** — Utility-first styling
- **Radix UI** — Accessible component library
- **React Query** — Data fetching and caching
- **tRPC** — End-to-end type-safe APIs
- **Framer Motion** — Animation library & AI motion intelligence
- **Lucide React** — Icon library
- **Wouter** — Lightweight routing

### Backend
- **Express** — Web framework
- **Node.js** — Runtime
- **Drizzle ORM** — Type-safe database toolkit
- **MySQL 2** — Database driver
- **AWS SDK** — Cloud storage integration (S3)
- **Jose** — JWT token handling

### Development
- **Vitest** — Unit testing framework
- **Prettier** — Code formatting
- **ESBuild** — Build optimizer
- **tsx** — TypeScript execution

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager (v10.4.1+)
- MySQL database instance

### Installation

```bash
# Clone the repository
git clone https://github.com/EDGEGlobe-lab/geo-midi-controller-app.git
cd geo-midi-controller-app

# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/geo_midi_controller

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Node environment
NODE_ENV=development
```

### Development

```bash
# Start the development server
pnpm dev

# The app will be available at http://localhost:5173

# In another terminal, watch for database changes
pnpm db:push
```

### Building for Production

```bash
# Compile and bundle the application
pnpm build

# Start the production server
pnpm start
```

### Other Commands

```bash
# Type checking
pnpm check

# Code formatting
pnpm format

# Run tests
pnpm test

# Database migrations
pnpm db:push
```

## Project Structure

```
geo-midi-controller-app/
├── client/
│   └── src/
│       └── components/
│           ├── LucidDreamLogoMotion.jsx    # 🧠 AI-powered lucid dream motion
│           └── ...                          # Other components
├── server/
│   └── _core/                              # Core server entry point
├── shared/                                 # Shared types and utilities
├── docs/                                   # Documentation
├── drizzle/                                # Database migrations
├── patches/                                # Dependency patches
├── logo.svg                                # 🏆 Championship neon logo
├── vite.config.ts                          # Vite configuration
├── drizzle.config.ts                       # Drizzle ORM configuration
├── package.json                            # Project dependencies
└── README.md                               # This file
```

## 🧠 Lucid Dream Motion AI Component

### Usage

```jsx
import LucidDreamLogoMotion from '@/components/LucidDreamLogoMotion';

export default function BrandPage() {
  return (
    <div>
      <LucidDreamLogoMotion />
    </div>
  );
}
```

### Component Features

The `LucidDreamLogoMotion` component provides:

- **Auto-Mood Cycling** — Automatically transitions through emotional states every 8 seconds
- **Interactive Mood Control** — 5 selectable mood buttons for manual override
- **Ocean Physics** — Real-time wave simulation and current animation
- **Particle System** — Bioluminescent bubble effects rising from the ocean floor
- **Sea Characters** — Finding Nemo inspired character animations
- **Dream Aura** — Pulsing neon aura around the logo
- **Real-time Feedback** — Live mood intensity and status display

### AI Mood Detection System

Each mood triggers unique animations:

```javascript
const moodStates = {
  discovery: { scale: 1.1, rotate: 15, color: '#39FF14', intensity: 0.8 },
  adventure: { scale: 1.2, rotate: 360, color: '#00FFFF', intensity: 1 },
  calm: { scale: 0.95, rotate: -10, color: '#87CEEB', intensity: 0.6 },
  playful: { scale: 1.05, rotate: 45, color: '#FFD700', intensity: 0.9 },
  mysterious: { scale: 1.15, rotate: 180, color: '#FF00FF', intensity: 0.7 },
};
```

## Database

The application uses MySQL with Drizzle ORM for type-safe database access.

### Generate and Run Migrations

```bash
pnpm db:push
```

This command will:
1. Generate migrations from your schema changes
2. Apply pending migrations to the database

## API Layer

The backend uses **tRPC** to provide a type-safe, end-to-end API between the React frontend and Express backend. No manual API types are needed — types flow automatically from server to client.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Run `pnpm format` before committing to ensure consistent code style
2. Add tests for new functionality
3. Keep the design system consistent with the Signal Laboratory guidelines
4. Update documentation for API or UI changes
5. Maintain AI motion intelligence aesthetic in animations

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/EDGEGlobe-lab/geo-midi-controller-app).

---

**GEO MIDI Controller App** — *A browser-native control room for shaping the GEO sound system with precision, play, and visible signal flow. Powered by Lucid Dream Ocean Intelligence. 🧠🌊✨*

🏆 **Championship Branding** | 🌊 **Ocean Dreamscape** | 🧠 **AI Motion Intelligence** | 🐠 **Finding Nemo Inspired**
