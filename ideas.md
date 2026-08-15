# GEO MIDI Controller Deck — Design Direction

## Three candidate approaches

### Theme Name: Signal Laboratory
Very dark, precision-console UI with cyan traces, phosphor meters, and instrument-rack typography. It makes the app feel like a serious studio machine rather than a generic audio dashboard.

**Probability:** 0.07

### Theme Name: Warm Tape Room
A warmer, analog-studio direction with amber meters, smoked glass panels, paper labels, and a softer mixing-desk mood. It emphasizes tactility and nostalgia over futuristic precision.

**Probability:** 0.03

### Theme Name: Aurora Flight Deck
A high-contrast space-navigation interface with orbital lines, ultraviolet accents, and bright star-map motion. It turns the music player into a navigational instrument.

**Probability:** 0.08

## Chosen Direction: Signal Laboratory

### Design Movement
Contemporary **neo-industrial editorialism**: a precision instrument panel softened by humanist typography, tactile surface noise, and the visual language of professional recording equipment.

### Core Principles
The interface should feel operational first, with every decoration supporting orientation, signal flow, or musical context. Color should behave like a meter: cyan for active transport, amber for attention, magenta for harmonic energy, and green for stable output. Dense channel information should be balanced by generous breathing room around the master transport. Every control must communicate state immediately through color, motion, or label changes.

### Color Philosophy
The base is near-black graphite rather than pure black, giving panels room to separate without heavy borders. Cyan is the ownable “signal live” color; amber marks timing and tempo; magenta identifies harmonic or FX energy; acid green means a safe, stable state. The palette is intentionally technical, but a subtle blue-grey atmospheric gradient keeps the experience from feeling sterile.

### Layout Paradigm
Use a **master-bus-first layout**: a wide top transport rail, a split master readout with signal scope, then a broad mixer field of channel strips. The master controls remain visible while the user scans channel details. On smaller screens, the mixer becomes a horizontally scrollable console rather than collapsing into a generic vertical form.

### Signature Elements
The app uses a thin vertical “signal rail” running through the master section, animated meter capsules instead of generic progress bars, and small monospace patch labels that feel like hardware scribbles. The visualizer is a restrained band of moving phosphor bars, not a decorative neon equalizer.

### Interaction Philosophy
Controls should respond like physical studio controls: short press confirmation, clear latched states, and no ambiguous toggles. Play and stop affect both the audio engine and the deck status. Mute and solo states must be legible without relying on color alone. Keyboard shortcuts are welcome, but they should be discoverable and never steal focus from the active control.

### Animation
Use short, crisp transitions under 220ms for controls. Let meter motion be continuous but low-amplitude so it does not distract from the mixer. The master scope can breathe on a slow cycle; channel strips should animate only when audio is playing. Respect reduced-motion preferences by freezing decorative movement while preserving state changes.

### Typography System
Use **Space Grotesk** for display labels and primary interface headings, paired with **IBM Plex Mono** for tempo, patch names, MIDI channels, and status readouts. Large numbers should be heavy and slightly tracked out; metadata should be compact, uppercase, and monospaced. Avoid Inter and avoid using a single font for every layer.

### Brand Essence
A browser-native control room for shaping the GEO sound system with precision, play, and visible signal flow. It is for producers, live coders, and curious listeners who want a music machine that explains itself. Personality: **precise, electric, composed**.

### Brand Voice
Headlines are concise and instrument-like. CTAs are verbs that imply motion, not onboarding. Microcopy should be calm, specific, and slightly tactile. Example lines: “Open the signal.” and “Route the next take.”

### Wordmark & Logo
The wordmark should be a compact uppercase GEO lockup with a split horizontal bar through the O, paired with a small three-line signal glyph. The mark is a circular waveform aperture: three offset arcs cut by a vertical fader line. It should read as a control symbol, not a generic music note.

### Signature Brand Color
**Signal Cyan — #55E6FF.** It is bright enough to read as active state on graphite, but cool enough to feel engineered rather than playful.

## Style Decisions

All implementation files should preserve the Signal Laboratory system: graphite surfaces, Signal Cyan transport, amber timing, magenta FX, acid-green stable output, Space Grotesk + IBM Plex Mono, master-bus-first layout, and concise hardware-console language.
