# USR Combat tracker

The plan is to implement a combat tracker for the USR system in FoundryVTT. The combat system in USR is not based on normal initiative order, but instead uses phases, and is resolved in an order decided by the GM.

## Data Model

- **Combat Document (`usrCombat`)**: Tracks the current phase of combat (`1: Define`, `2: Resolve`, `3: Combat`).
- **Combatant Document (`usrCombatant`)**: Stores action data in `flags.usr.action`:
  - `stance`: `aggressive`, `neutral`, or `defensive`.
  - `type`: `melee` or `ranged`.
  - `targetId`: ID of the target combatant, or a custom string for non-combatant targets.
  - `movement`: `none`, `slow`, or `fast`.
  - `description`: Free text action description.
  - `revealed`: Boolean (hidden from others in Phase 1).
  - `acted`: Boolean (tracked in Phase 3).
  - `status`: `win`, `loss`, `tie`, or `failed` (calculated in Phase 2).

## Phase 1 - Define your action

In the first phase, all characters decide their action. Actions are hidden from all other players and the GM until revealed by the GM.

### Options

- **Melee**: Stance Aggressive, Neutral, or Defensive.
- **Ranged**: Stance Aggressive, Neutral, or Defensive.
- **Movement**: None, Slow, or Fast (Fast unavailable in Neutral stance).
- **Target**: Choose a combatant or enter a custom target.
- **Description**: Free text for flavor or specific intent.

## Phase 2 - Resolve initiative

In the second phase, all actions are revealed, and initiative is resolved using the standard `usrRoll` mechanic.

- **Aggressive Stance**: Difficulty 6 (6 dice).
- **Neutral Stance**: Difficulty 3 (3 dice).
- **Defensive Stance**: No initiative roll.

Initiative (number of successes) is compared to the target's initiative:

- **Win**: Successes > Target's successes.
- **Tie**: Successes == Target's successes (both > 0).
- **Loss**: Successes < Target's successes.
- **Failed**: 0 successes (failed roll).

For custom targets, the GM manually assigns the status.

## Phase 3 - Resolve combat round

The GM decides the order of resolution. Only characters with a `win` or `tie` status may perform their primary attacks, though others may still defend or take minor actions as determined by the GM.

The tracker will keep track of who has "Acted" this round. When all characters have performed their actions, the round ends.

## Technical Implementation

1.  **Extend `Combat`**: Create `usrCombat` to handle phase transitions and state.
2.  **Extend `Combatant`**: Create `usrCombatant` to handle initiative logic using `usrRoll` and store action flags.
3.  **Extend `CombatTracker`**: Create `usrCombatTracker` to provide a custom UI for action selection and phase-based controls.
4.  **Register Classes**: Update `usr.mjs` to register the new classes in `CONFIG`.
