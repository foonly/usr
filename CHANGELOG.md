# Changelog

## 1.7.0 (2026-08-03)

#### Features

- sheet: update item display and weight calculation (ef272b3)
- sheet: update item display and armor calculations (cae772b)
- data: calculate and display armor deflection range (d01cff1)
- combat: automate phase transitions and turn handling (6deb73e)

#### Refactor

- config: update deflect dice logic and add d2 support (80292f2)

## v1.6.0 (2026-07-30)

#### Features

- actor: implement encumbrance system (2fadc66)
- docs/actor: add encumbrance rules and fix spelling (9b708ff)
- combat: show target name and individual hit math on burst and damage rolls (20b0347)

#### Documentation

- combat: document burst and auto fire rules (331c73a)

## v1.5.0 (2026-07-30)

#### Features

- roll: handle burst and auto-fire misses (f15c86d)
- combat: implement burst and auto fire system for ranged weapons (aeb5b91)
- actor: add encumbrance calculation and update sheet layout (73cb826)
- actor: calculate and display total equipped weight (c6ccc2d)

#### Bug Fixes

- actor: implement configurable weight units and logic (4a2c8a4)

### v1.4.3 (2026-07-29)

#### Bug Fixes

- sheet: increase default actor sheet dimensions (e7bf389)

### v1.4.2 (2026-07-29)

#### Bug Fixes

- roll: initialize unedited skill traits on roll and XP roll (c11a91b)

### v1.4.1 (2026-07-22)

#### Refactor

- data: remove redundant initial empty array options (98ef24e)

## v1.4.0 (2026-07-21)

#### Features

- actor: add contacts system (a5b6ee1)
- damage: add hit location tracking to damage system (f6b6390)

## v1.3.0 (2026-07-20)

#### Features

- combat: implement weapon magazine management and armor deflection (c121482)
- armor: add hit location coverage system (fd74d12)
- actor: Implement blood pool and bleeding mechanics (95eb62e)

#### Documentation

- add damage and trauma mechanics (6a34304)
- rules: merge levels 19 and 20 in character generation table (b2580c7)

## v1.2.0 (2026-07-16)

#### Features

- roll: improve chat roll styling and flavor text (aa24bcc)
- actor: add trait modifiers (5dd2101)

### v1.1.7 (2026-07-12)

#### Bug Fixes

- migration: refactor data migration for efficiency and robustness (5a673c1)

### v1.1.6 (2026-07-03)

#### Bug Fixes

- data: improve skill trait migration and validation (cf9801e)

### v1.1.5 (2026-07-02)

#### Bug Fixes

- migration: improve actor trait migration logic (b1ad956)

### v1.1.4 (2026-07-02)

#### Bug Fixes

- sheet: set default values for trait properties in TraitSheet (4c0fec0)

#### Styles

- css: standardize font size variables (1219d62)

### v1.1.3 (2026-07-02)

#### Styles

- css: refactor actor header layout and move chip styles (a467795)

### v1.1.2 (2026-07-01)

#### Continuous Integration

- github: update zip command and exclusion list (1fbff1a)

### v1.1.1 (2026-07-01)

#### Styles

- css: update chat styling and font variables (822945a)
- css: update typography and font variables (fb781f9)

#### Continuous Integration

- github: automate release process with foonver (54248a1)

## v1.1.0 (2026-06-14)

#### Features

- config: add Unarmed specialization to melee weapons (8773fb8)

## v1.0.0 (2026-06-14)

#### Features

- data: refactor trait system and add migrations (eb98059)
- traits: transition to structured specialization and skill system (61e7f50)

#### Styles

- css: Refactor actor items tables and UI (c4130ba)

### Misc
- Version (1076693)

### v0.8.1 (2026-06-14)

#### Styles

- css: improve dark theme styling for chat interface (1c8f527)

## v0.8.0 (2026-06-14)

#### Features

- combat: implement robust combat interaction resolution (77bec66)
- combat: implement DialogV2 for attack defense (18995ca)

#### Bug Fixes

- combat: update resolution message sender and display (29688d4)

#### Styles

- css: refactor chat combat interaction layout (d9eed05)

## v0.7.0 (2026-06-13)

#### Features

- combat: implement tactical defense mechanics (1063b5f)
- item: assign default icons based on item type (0388b43)
- combat: implement interactive combat flow (37239d7)
- combat: implement active defense and attack actions (906d8ce)

#### Bug Fixes

- combat: update target management and hook synchronization (d404ad6)

## v0.6.0 (2026-06-13)

#### Features

- combat: implement defensive stance initiative rolls (d0ac3f9)
- combat: implement position tracker and combat phase UI (97cb407)

## v0.5.0 (2026-06-07)

#### Features

- combat: implement dynamic custom target toggling in action selection (faf27b6)
- roll: implement damage penalties and improve weapon roll handling (4c8863c)
- items: implement expanded weapon and armor data models (a81b35b)
- combat: implement USR phase-based combat tracker (fd1bbef)

#### Bug Fixes

- combat: add missing item ID to combat weapon edit buttons and remove debug logs (3459ce4)

#### Refactor

- roll: remove debug console logs from roll and sheet logic (dfe904e)
- data: migrate templates to DataModels (42e57ec)

#### Documentation

- update README with project details and compatibility info (ea5f4ba)
- combat: add hitlocation and range tables and weapon definitions (a65f1e7)
- refactor combat documentation (09552a6)
- restructure core rules and add character progression (ae414b2)
- add USR System core rules documentation (cd5f2d1)

#### Continuous Integration

- github: remove unnecessary build steps from release workflow (568e1d2)

#### Maintenance

- build: revert version to 0.4.5 (112bbb4)
- build: rename versionSync to version-sync in foonver.toml (d623e8e)
- build: remove SASS compilation and Makefile (ed46b9d)

### v0.4.3 (2026-06-03)

#### Maintenance

- version: bump version to 0.4.2 (7182fb0)

### v0.4.1 (2026-06-03)

## v0.4.0 (2026-06-03)

#### Features

- ui: migrate text editors to prose-mirror component (22870f9)
- ui: overhaul sheet styling and theme system (414d8db)

#### Bug Fixes

- improve roll logic and data validation (81e55b8)

#### Refactor

- code: clean up document methods and improve data handling (9ef323e)
- sheets: modernize sheet layout and styling (30c0774)
- sheet: remove unused cssClass from sheet rendering (54c1ee5)
- application: migrate core sheets to Application V2 (ac6ead6)

#### Styles

- layout: update table cell alignment and editor component sizing (ec4c0ad)
- actor: fix indentation in actor sheet imports (3094ad9)

#### Maintenance

- system: update compatibility to version 14 (22909d5)

### v0.3.3 (2025-10-29)

### Misc
- Update heal dialog to use foundry's handlebars renderer (a29cb6d)
- Refactor damage and roll helpers for async and style (fbe9669)
- Reorganize success counting logic for negative difficulty (cb90c39)

### v0.3.2 (2025-07-03)

### Misc
- Fix successes calculation when rolling tens (85bedb3)

### v0.3.1 (2025-07-02)

### Misc
- Update GitHub Actions workflow dependencies and setup (0de04a9)

## v0.3.0 (2025-07-02)

### Misc
- Migrate to PNPM and V13 compatibility (c103c64)

## v0.2.0 (2024-07-15)

### Misc
- v12 compat changes (212d5bb)

### v0.1.23 (2023-12-12)

#### Maintenance

- assets: Working basic asset manager. (120405e)

### Misc
- chore (chips): Chip roller and removal. (d4cbac3)
- Generic Dice roller message function added. Working Fate chip roller. (fa30e07)

### v0.1.22 (2023-11-28)

### Misc
- Created fate chip roller. (8fe482c)

### v0.1.21 (2023-11-21)

### Misc
- Temporary Chip fix. (3c92ffc)
- Individual hip display. (74f8a7f)

### v0.1.20 (2023-11-21)

### Misc
- Release file fix (b8d0e9e)

### v0.1.19 (2023-11-21)

### Misc
- Switched to zip (75ff110)

### v0.1.18 (2023-11-21)

### Misc
- Should now hopefully be able to update self. (2f25d35)

### v0.1.17 (2023-11-21)

### Misc
- Push system.json separately. (1eda130)

### v0.1.16 (2023-11-21)

### Misc
- For some reason lock file was ignored. (81480ad)

### v0.1.15 (2023-11-21)

### Misc
- Forgot the install step (8a9cf17)

### v0.1.14 (2023-11-21)

### Misc
- Postversion script (e603ca3)
- Release workflow (36ab8a0)

### v0.1.13 (2023-11-21)

### Misc
- Even more testing (7f79ff9)
- More testing (97b105e)
- Versioning Test (a1ea7ff)
- Some updates? (2b1f492)
- Fate chips and basic items. (542e16c)
- Knowledge tab complete. (6031b8b)
- Handlebars template extensions (9c37f94)
- Handlebars (004f27f)
- Somewhat working knowledge tab (1c32d35)
- Language skills (4783c00)
- Cleanup and some biography and knowledge stuff. (3010dcb)
- Fixed Custom roll for XP (94e77ab)
- More damage stuff, broke custom roller. (2326fd8)
- Per beer commit. (cdc056c)
- Damage and healing functions. (79194eb)
- Damage stuff (af5f9e3)
- Custom roller. (1722783)
- Working trait editor and specializations. (4f1dfee)
- Trait edit sheet start. (10af828)
- Did some layout stuff. (46f5e03)
- Roll and start on specializations. (2753a06)
- Working roller (b317599)
- Basic USR roller type. (c2739f1)
- Dice roller (fc3bf25)
- Some progress? (e9a9bfc)
- Updated base to new boilerplate. (4bd8d72)
- Some tweaks (1277014)
- Base stuff (51cf5b8)
- Switch to v.10 compatible base. (f2319f9)
- Some extra stuff. (ec1a09b)
- Boilerplate system (103abdf)
- Initial commit (af65623)

