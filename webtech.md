# PixelPure – Technical Intelligence & Architecture

## Core Philosophy: Tactile Intelligence
PixelPure is built on the concept of **Tactile Intelligence**—a design system that bridges the gap between digital precision and physical form. It utilizes a hybrid of **Neumorphism** (soft, extruded surfaces) and **Glassmorphism** (sophisticated transparency) to represent the transformative power of AI background removal.

### Design Pillars
- **Dimensionality:** Every element exists in a 3D space with defined Z-axis relationships (Elevation 0 to +3).
- **Luminosity:** Light sources dictate shadows (#E2E8F0) and highlights (#FFFFFF), creating realism.
- **Fluidity:** Transitions are weighted and physical, utilizing cubic-bezier curves for organic movement.

---

## Technical Stack

### Frontend Architecture
- **Framework:** React 18+ with Vite for ultra-fast development and optimized builds.
- **Styling:** Vanilla CSS + TailwindCSS (for utility-first layout) with custom design tokens for the "Aetheric Depth" system.
- **Icons:** Lucide-React for consistent, stroke-based iconography.
- **Animations:** CSS Keyframes and transition-group logic for smooth state changes.

### AI Infrastructure (On-Device)
- **Engine:** `@imgly/background-removal`
- **Performance:** Runs entirely in the browser via WebAssembly (WASM).
- **Security:** Images never leave the client's device, ensuring 100% privacy and zero server latency.
- **Infrastructure:** Required **COOP (Cross-Origin-Opener-Policy)** and **COEP (Cross-Origin-Embedder-Policy)** headers to enable multi-threaded WASM execution.

---

## Component Depth Hierarchy

| Level | Style | Usage | Elevation |
| :--- | :--- | :--- | :--- |
| **Base (0)** | `--surface` | Main background substrate | 0 |
| **Recessed (-1)** | `neu-inset` | Input fields, dropzones, progress tracks | -1 |
| **Elevated (+1)** | `neu-raised` | Buttons, cards, secondary features | +1 |
| **Floating (+2)** | `glass` | Navbars, active toolbars, compare sliders | +2 |
| **Overlay (+3)** | `glass` + Deep Shadow | Modals, processing indicators, toast notifications | +3 |

---

## Key Implementation Details

### 1. Liquid Progress Flow
The progress indicator uses a multi-layered CSS animation system:
- **Track:** `neu-inset` for a carved look.
- **Fill:** Linear gradient (Blue to Violet) with a `liquid-flow` animation shifting the background-position.
- **Gloss:** Semi-transparent overlay to simulate light reflecting off a liquid surface.

### 2. Image Comparison Engine
Utilizes a `clip-path` based comparison system:
- **Original Layer:** Static bottom layer.
- **Processed Layer:** Clipped by a dynamic percentage controlled by the slider handle.
- **Checker Layer:** Injected between layers to provide a visual cue for transparency.

### 3. Floating AI Toolkit
A specialized glass panel that utilizes `backdrop-filter: blur(16px)` and a high-contrast rim light (1px border) to maintain readability over any image color. It provides contextual tools (Erase/Restore) and output settings (Format/Background) in a consolidated 3D space.

---

## Project Roadmap

- [x] Core AI Integration (imgly/background-removal)
- [x] Tactile Intelligence UI Foundation
- [x] Neumorphic & Glassmorphic Component Library
- [x] Responsive Comparison Preview
- [x] Floating Toolkit & Output Settings
- [ ] Advanced Brush-based Mask Refinement
- [ ] Batch Processing Support
- [ ] Project Export/History System
