# PK's Pokédex (FullStack / LLM Pokédex)

A modern, responsive, and feature-rich Pokédex web application built with vanilla JavaScript (ES modules), HTML5, and CSS3, styled in an iconic **Pikachu Yellow Edition** handheld shell.

![Pikachu Yellow Pokédex](assets/pokeball_3d.png)

## ⚡ Features

- **PokéAPI v2 Integration**: Search any of the 1025 Pokémon by name or National Pokédex number.
- **Pikachu Yellow Edition Chassis**: Handheld retro-modern console styling with tactile hardware buttons, pulsing LEDs, and 3D Pokéball sensor.
- **Dynamic Elemental Theming**: UI accent colors and ambient glow dynamically adapt to each Pokémon's primary elemental type (Fire, Water, Grass, Electric, Dragon, etc.).
- **Interactive 3D Pokéball**: Glossy 3D rendered Pokéball with subtle hover animations and specular effects.
- **Detailed Biological & Battle Stats**:
  - Species description and genus
  - Physical metrics (Height & Weight with imperial conversions)
  - Base experience & abilities (with hidden ability indicator)
  - Animated base stat progress bars (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed)
- **Evolution Chains**: Interactive multi-stage evolutionary lines with thumbnail sprites that allow direct navigation to evolved or pre-evolved forms.
- **Shiny Toggle**: Instantly switch between standard and Shiny Pokémon sprites with visual sparkle feedback.
- **Authentic Audio Cries**: Listen to official Pokémon sound cries directly from the PokéAPI audio repository.
- **Elemental Type Filter Drawer**: Browse Pokémon by typing (Water, Fire, Grass, Electric, etc.) or explore all 1025 Pokémon in a visual grid.
- **Navigation & Shortcuts**:
  - Previous / Next / Random buttons
  - Popular quick-search chips (Pikachu, Charizard, Gengar, Mewtwo, Eevee, Snorlax)
  - Arrow key keyboard shortcuts (`←` for Previous, `→` for Next)

## 📁 Project Structure

```
├── index.html        # Semantic HTML5 layout with accessible tabs 
├── style.css         # Complete Pokedex design system, animations, and responsive styles
├── app.js            # Application logic, PokéAPI controllers, and event listeners
├── variables.js      # Configuration constants, stat definitions, and type color palettes
├── assets/           # 3D Pokéball renders, SVG icons, and visual graphics
└── README.md         # Project documentation
```

## 🚀 Getting Started

No build tools or bundlers are required! Simply serve the directory with any local static HTTP server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node (npx)
npx serve .
```

Open `http://localhost:3000` in your web browser.

## 📄 License

MIT
