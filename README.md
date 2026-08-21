# GEO MIDI Controller App

<div align="center">
  <img src="./logo.svg" alt="GEO MIDI Controller App - Neon Green Blueberry Logo" width="180" height="180" />
  <p><em>A browser-native control room for the GEO electronic music system</em></p>
</div>

A standalone deployable audio controller deck with bundled playback, transport controls, visual meters, and advanced multi-track mixing channels for the GEO electronic music system.

**Built with [Manus](https://manus.build)** — a modern full-stack framework combining React, Express, TypeScript, and Drizzle ORM.

## Features

- 🎚️ **Professional Mixer Interface** — Multi-track channel strips with independent controls
- ⏯️ **Transport Controls** — Play, stop, and navigation with visual feedback
- 📊 **Visual Meters** — Real-time signal monitoring with animated meter capsules
- 🎵 **Audio Playback** — Integrated playback engine with track synchronization
- 🛠️ **MIDI Integration** — Native MIDI controller support
- 🌙 **Dark-Mode UI** — Neo-industrial Signal Laboratory design system
- 📱 **Responsive Layout** — Master bus-first layout optimized for studio workflows

## Design System

The app implements the **Signal Laboratory** design direction: a precision instrument panel with a contemporary neo-industrial aesthetic.

### Visual Language

- **Base Color**: Near-black graphite surfaces for visual separation without heavy borders
- **Signal Cyan** (`#55E6FF`): Indicates active transport and live signals
- **Amber**: Marks timing, tempo, and rhythmic cues
- **Magenta**: Highlights effects and special parameters
- **Acid Green**: Indicates stable, healthy output

### Typography

- **Space Grotesk**: Display labels and primary interface headings
- **IBM Plex Mono**: Tempo, patch names, MIDI channels, and status readouts

### Interaction Model

- Short, crisp control responses with latched states
- Meter motion that breathes without distraction
- Animated transitions under 220ms
- Tactile feedback mimicking physical studio controls

## Tech Stack

### Frontend
- **React 19** — UI framework
- **Vite** — Build tool and dev server
- **TypeScript** — Type-safe development
- **TailwindCSS 4** — Utility-first styling
- **Radix UI** — Accessible component library
- **React Query** — Data fetching and caching
- **tRPC** — End-to-end type-safe APIs
- **Framer Motion** — Animation library
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
├── client/              # React frontend application
├── server/              # Express backend server
│   └── _core/          # Core server entry point
├── shared/             # Shared types and utilities
├── docs/               # Documentation
├── drizzle/            # Database migrations
├── patches/            # Dependency patches
├── logo.svg            # Neon green blueberry branding logo
├── vite.config.ts      # Vite configuration
├── drizzle.config.ts   # Drizzle ORM configuration
├── package.json        # Project dependencies
└── README.md           # This file
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

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/EDGEGlobe-lab/geo-midi-controller-app).

---

**GEO MIDI Controller App** — *A browser-native control room for shaping the GEO sound system with precision, play, and visible signal flow.*
