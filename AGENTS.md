# USR: Universal Simple Role-Playing for Foundry VTT

This project is an implementation of the **Universal Simple Role-Playing (USR)** system for Foundry Virtual Tabletop. It aims to be minimal, mirroring the simplicity of the USR system itself.

## Project Structure

The project follows the standard Foundry VTT system structure, utilizing modern features like DataModels.

- `usr/module/`: Core JavaScript logic.
  - `usr.mjs`: Entry point. Initializes the system, registers models, and sets up hooks.
  - `data/`: Contains `DataModel` definitions (`actor-data.mjs`, `item-data.mjs`), which define the schema for Actors and Items.
  - `documents/`: Custom Document classes (`actor.mjs`, `item.mjs`, `combat.mjs`) extending Foundry's base classes to add system-specific logic (e.g., `roll()` methods).
  - `sheets/`: Custom sheet classes (`actor-sheet.mjs`, `item-sheet.mjs`) extending `foundry.applications.sheets.ActorSheet/ItemSheet`.
  - `helpers/`: Utility functions and configuration constants.
- `usr/templates/`: Handlebars (`.hbs`) files defining the HTML structure of character sheets and other UI elements.
- `usr/css/`: Styling for the system.
- `usr/lang/`: Localization files (English provided in `en.json`).
- `usr/docs/`: Documentation for the USR system rules (Core Rules, Combat, Character Generation).
- `usr/system.json`: The manifest file that tells Foundry how to load the system.

## Development

### Prerequisites

- [Foundry VTT](https://foundryvtt.com/) installed.
- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### Key Technologies

- **Foundry VTT API**: Specifically compatible with v12 and v14.
- **DataModels**: Used for structured data validation and default values.
- **Handlebars**: Templating engine for UI.
- **CSS**: Modern CSS with variables, nesting and imports.
- **ES Modules**: Modern JavaScript module system.

## Core Concepts

- **Actors**: Supports `character` and `npc` types.
- **Items**: Supports `item`, `melee`, `ranged`, and `armor` types.
- **Rolling**: Uses Foundry's built-in `Roll` API often triggered via `item.roll()` or clicking attributes on sheets. All attribute/skill rolls use the usrRoll() helper in module/helpers/roll.mjs that handles rule specific roll behavior.
