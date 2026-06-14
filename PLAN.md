# Traits, Specializations & Knowledge skills

The system now uses a completely free form system to add specializations and knowledge skills. This is very flexible, but leads to problems with inconsistent scope and difficulty to target actual specializations. It also makes it difficult to match weapon types to their specializations.

As USR is designed as a generic system that could be used in many time periods and settings we also need to build in modularity for all Traits, Specializations and knowledge skills. Some traits should always be the same, as they are core attributes and skills. These are Fortitude, Intelligence, Initiative, Willpower, Awareness, Mobility, Melee and Ranged. But skills like Mobility, Melee and Ranged can have different specializations.

All these values should be overridable with Foundry Modules. But a this change should not break backwards compatibility for existing campaigns (all using the base values now in the system). If we make breaking changes, we need to make a conversion script that updates existing campaigns to the new system.

## UI & Interaction Design

1.  **Character Sheet**:
    - Only display specializations that have a `value > 0`.
    - Visually flag "Legacy" specializations (those with a `title` that doesn't match any slug in the trait's configuration).
    - "Unapproved" Knowledge skills will have a visual warning icon for GMs.
2.  **Edit Trait Dialog**:
    - Instead of an "Add" button, the dialog will list **all** specializations defined for that trait in `CONFIG.usr.specializations`.
    - Users can set the value for any specialization. Setting it to `0` removes it from the character sheet.
    - Legacy specializations currently on the character will also be listed (marked as Legacy) so they can be edited or cleared.
3.  **Item Sheet**:
    - Specialization field becomes a single dropdown populated from the relevant trait's config (Melee or Ranged).
4.  **Knowledge Management**:
    - A "Manage Knowledge" dialog for GMs to approve/reject player-added skills and edit the world-wide list.

## Traits

These will be the same as now, but we need to make it possible for modules to change them. They can also possibly change the number of traits.

### Core Traits (Always Present)

- Fortitude
- Intelligence
- Initiative
- Willpower
- Awareness
- Mobility
- Melee
- Ranged

### Skill Traits (Settings dependent)

- Medicine
- Engineering
- Charisma
- Survival
- Subterfuge
- Animals
- Craftsmanship
- Naval

## Specialization

These should be converted from a free text version to a fixed list of specializations, but one that is easy to modify in the code, and update with modules. If possible this could even be modified for the active world, maybe even with a UI, but this is optional. The current campaigns have a Western / Victorian theme (1860s), so we will make the base list follow that.

### Draft Specialization List (Western/Victorian 1860s)

**Mobility**

- Stealth
- Running
- Climbing
- Swimming
- Acrobatics (Added)
- Jumping (Added)

**Melee**

- Axes
- Swords
- Knives
- Clubs
- Bayonets
- Brawling (Added)
- Whips (Added)

**Ranged**

- Rifles
- Pistols
- Shotguns
- Artillery
- Bows
- Thrown
- Muskets (Added)
- Crossbows (Added)

**Medicine**

- First Aid
- Surgery
- Treatment
- Assessment
- Pharmacology
- Veterinary (Added)
- Forensics (Added)
- Psychiatry/Alienist (Added)

**Engineering**

- Architecture
- Fortifications
- Mechanics
- Chemistry
- Steam Engines
- Civil Engineering (Bridges/Rails) (Added)
- Explosives (Added)
- Telegraphy (Added)

**Charisma**

- Entertainment
- Persuasion
- Leadership
- Acting
- Gambling
- Rhetoric
- Intimidation
- Haggling
- Etiquette (Added)
- Diplomacy (Added)

**Animals**

- Falconry
- Riding
- Dogs
- Training (Added)
- Breaking (Added)
- Herding (Added)

**Subterfuge**

- Lockpicking
- Pickpocketing
- Camouflage
- Forgery
- Disguise
- Safe-cracking (Added)
- Sleight of Hand (Added)
- Shadowing (Added)

**Craftsmanship**

- Smithing
- Carpentry
- Cooking
- Tailoring
- Leatherworking
- Gunsmithing (Added)
- Printing (Added)
- Brewing/Distilling (Added)

**Survival**

- Traps
- Tracking
- Herbology
- Hunting
- Fishing
- Foraging (Added)
- Scouting (Added)
- Weather Sense (Added)

**Naval**

- Navigation
- Sailing
- Gunnery (Naval)
- Piloting (Added)
- Rigging (Added)
- Whaling (Added)

## Knowledge skills

These are flavour skills, and are never directly rolled against. There are also too many potential ones to make an exhaustive list. But we would need a base list of these, fitting the theme. And a way to add more of them, either on a world level (preferred option), or per character if the world option is not possible.

### Draft Knowledge Categories

- History
- Folklore
- Law
- Literature
- Science (General)
- Religion
- Politics

## Open Questions & Kinks to Iron Out

1.  **Backwards Compatibility**: How do we handle existing characters with "Custom" specializations not in the new fixed list?
    - _Decision_: **Option C**. Keep existing specializations as-is. They will continue to display on the character sheet but should be visually marked as "Legacy" or "Custom" if they don't match the current fixed list. When a user edits a specialization, they will be presented with the new fixed list to choose from.
    - _Action Item_: Implement a check on the character sheet to flag specializations not found in `CONFIG.usr.specializations`.
2.  **Item Links**: Currently, weapons have a `specialization` string. Should this also become a select?
    - _Decision_: Yes, change the item sheet specialization field to a dropdown selection.
    - _Mapping Strategy_:
      - **Slugs**: Use unique keys (e.g., `swords`, `rifles`, `stealth`) as the source of truth in `item.system.specialization` and `actor.system.traits[trait].spec[i].title`.
      - **Configuration**: `CONFIG.usr.specializations` will be a nested object: `traitSlug -> specSlug -> localizationKey`.
      - **Localization**: UI will always look up the label via `game.i18n.localize(CONFIG.usr.specializations[trait][slug])`.
    - _Backwards Compatibility Logic_:
      - When rolling, the system will check for a match on the **Slug** first.
      - If no match is found, it will check if the legacy `title` matches the **localized Label** of the current weapon's specialization.
      - This allows old characters with "Swords" to still benefit from a weapon with the `swords` slug.
    - _Migration_: Existing items with free-text specializations should be updated to slugs.
3.  **Knowledge Skill "Level" & Management**:
    - _Purpose_: Narrative flavor and GM guidance (e.g., Basic = general info, Advanced = specific secrets).
    - _Levels_: Keep the current levels: `None (0)`, `Basic (1)`, `Good (2)`, `Advanced (3)`.
    - _Source_:
      - **System Default**: A base list of common categories (History, Law, Folklore, etc.) in `CONFIG.usr`.
      - **World List**: A world setting (JSON or simple list) that GMs can use to add world-specific knowledge skills.
    - _Player Interaction_: Players can add new knowledge skills directly on their sheets.
    - _Approval System_:
      - Added skills are stored in the actor's `knowledge` array.
      - Add an `approved` boolean to the knowledge schema (default: `true` for system/world defaults, `false` for player-added).
      - Visually mark "Unapproved" skills on the character sheet for the GM to see and toggle.
4.  **World Specifics**: You mentioned "Bison" should be more generic. Should we have a "Herding" or "Husbandry" specialization instead, or keep it specific to the 1860s Western theme as the default?
5.  **Trait Modularity (Core vs. Skill Traits)**:
    - _Decision_: Split traits into "Core" (fixed in schema) and "Skills" (dynamic).
    - _Core Traits_: `fortitude`, `intelligence`, `initiative`, `willpower`, `awareness`, `mobility`, `melee`, `ranged`. These are referenced by system logic (e.g., combat, damage calculations) and should always exist.
    - _Skill Traits_: `medicine`, `engineering`, `charisma`, `survival`, `subterfuge`, `animals`, `craftsmanship`, `naval`. These can be renamed, hidden, or added to by modules.
    - _Technical Implementation_:
      - Use a `MapField` or a dynamic `SchemaField` for skill traits.
      - `CONFIG.usr.traits` will define which skill traits are active and what their labels/specializations are.
    - _Conversion/Migration_:
      - A migration script will run on world load.
      - It will move existing skill trait data from the fixed fields into the new dynamic structure.
      - If a module has renamed a trait (e.g., `charisma` -> `presence`), the script will map the old data to the new key based on the module's configuration.
