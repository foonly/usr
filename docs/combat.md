# USR System: Combat Rules (v2.0 Draft)

## Combat Rounds

When engaged in close combat, either melee or ranged, the GM may choose to switch to turn based combat. Turn based combat in USR is organized into three distinct phases per round. In FoundryvTT the GM manages these phases using the Combat Tracker.

### Phase 1: Define Actions

In this phase, all participants determine their plan for the round.

- **Stance Selection:** Choose between Aggressive, Neutral, or Defensive.
- **Targeting:** Select a target combatant from the list or enter a custom target.
- **Movement:** Specify movement speed (None, Slow, or Fast).
- **Stance Effects:** Aggressive stances allow Fast movement and easier initiative (Difficulty 6), while Neutral stances limit movement to Slow and have standard initiative (Difficulty 4). Defensive stances focus on protection and roll a harder (Difficulty 2) initiative.

### Phase 2: Resolve Initiative

Once actions are defined, participants roll for initiative.

- **Rolling:** Click the d20 icon in the tracker to roll. Aggressive actions require higher rolls (Difficulty 6) to succeed, reflecting the risk of charging in.
- **Comparison:** The system automatically compares successes against targets. A combatant wins initiative if they have more successes than their target.

### Phase 3: Resolve Combat

The GM decides the final order of execution based on the results from Phase 2.

- **Activating Combatants:** The GM clicks the "Play" icon next to a combatant to start their turn.
- **Automation:** Activating a combatant automatically:
  - Sets them as the active turn in Foundry.
  - Pans the map to their token and selects it.
  - Automatically targets their chosen opponent in the Foundry interface.
  - Marks the _previous_ active combatant as "Acted" (indicated by a checkmark).
- **Acted State:** Combatants can be manually toggled as "Acted" using the checkmark icon.

Once all combatants have acted, the GM advances to the next round, which resets the tracker for Phase 1.

## Combat actions

Each combatant has one main action that they can perform each round. This can be an attack or a defensive action, or even something not directly related to the combat, like reloading a weapon, unlocking a door or something similar.

In addition some extra actions can be performed by using position. A defensive action can always be performed by paying a point of position. Special rules may allow other actions as well.

## Stances

In the first phase the combatants choose their stance out of 3 possibilities. The chosen stance affects the initiative roll, defensive rolls and how difficult the character is to hit.

### Argressive Stance

In aggressive stance the character prioritizes mobility and offensive actions over defense. Aggressive stance gives the character a higher initiative roll of 6 dice, but roll 2 dice for defence.

### Neutral Stance

In neutral stance the character balances mobility and defense, with a standard initiative roll of 4 dice and a defence roll of 3 dice.

### Defensive Stance

In defensive stance the character focuses on defense. Defensive stance rolls 2 dice for initiative, but get a +2 position increase in the beginning of the turn. Defensive stance rolls 4 dice for defence. Defensive stance can perform defensive actions without paying position. Attacks from defensive stance always has a -1 modifier. (Attacks are rolled with 3 instead of 4 dice)

## Position

Combat uses a **Position Monitor** (Value 0 to 5, default 4).

Postion can be gained by pre-buying a position boost in phase 1. The character may choose to use a success from the initiative roll to increase their position. If this action is taken, one of the initiavite successes will be used for the position increase. If the initiative roll fails, the position is not gained. If the used success reduces successes to 0, the position is gained, but the initiative counts as failed.

Position can be used for different things in combat.

### Initiative boost

By reducing position, the character can add on die to the initiative roll per position reduced.

### Defensive actions

Position can be reduced to perform extra defensive actions. So as long as the character has position, they can perform defensive actions. Defensive actions can also be boosted by paying one position per extra die.

### Attacks

If the character is in aggressive stance, they can pay position to perform extra attacks. A character can't attack the same target twice in one round, but if previous attack rolls against a target have failed (a failed roll, not a defended against attack), that target can be attacked.

## Defense

- **Melee Defense:** Stance/Skill Dice + Weapon Defense Rating.

### Melee Hitlocation Table (2D10)

| Roll  | Location | Dice Cost | Lethality |
| :---: | :------- | :-------: | :-------: |
|   2   | Head A   |    -3     |    +2     |
|   3   | Head B   |    -3     |    +1     |
|   4   | Arms B   |    -2     |    -2     |
|  5-7  | Arms A   |    -2     |    -1     |
| 8-12  | Torso A  |    -1     |    +1     |
| 13-14 | Torso B  |    -1     |    +0     |
| 15-18 | Legs B   |    -2     |    -1     |
| 19-20 | Legs A   |    -2     |    +0     |

### Ranged Hitlocation Table (2D10)

| Roll  | Location | Lethality |
| :---: | :------: | :-------: |
|   2   |  Head A  |  Deadly   |
|   3   |  Head B  |  Serious  |
|  4-6  |  Arms A  | Moderate  |
|   7   |  Arms B  |   Light   |
|   8   | Torso A  |  Deadly   |
| 9-12  | Torso B  |  Serious  |
| 13-14 | Torso C  | Moderate  |
| 15-18 |  Legs B  | Moderate  |
| 19-20 |  Legs A  |  Serious  |

### Normal Range Table

| Accuracy | Point Blank (6D) | Short (4D) | Medium (3D) | Long (2D) | Very Long (1D) |
| :------: | :--------------: | :--------: | :---------: | :-------: | :------------: |
|    1     |        2         |     5      |     15      |    20     |       30       |
|    2     |        3         |     7      |     20      |    33     |       55       |
|    3     |        4         |     10     |     25      |    45     |       80       |
|    4     |        4         |     13     |     35      |    60     |      110       |
|    5     |        4         |     15     |     45      |    75     |      130       |

### Aimed Range Table

| Accuracy | Short (4D/Aim 1) | Medium (3D/Aim 2) | Long (2D/Aim 3) | V. Long (1D/Aim 4) |
| :------: | :--------------: | :---------------: | :-------------: | :----------------: |
|    1     |        15        |        25         |       45        |         60         |
|    2     |        35        |        60         |       85        |        100         |
|    3     |        50        |        90         |       140       |        180         |
|    4     |        60        |        100        |       190       |        350         |
|    5     |        70        |        130        |       240       |        500         |
|    6     |        80        |        150        |       300       |        700         |
|    7     |       100        |        180        |       400       |        900         |

## Weapons & Armour

### Ranged Weapons

- **Damage:** 1 to ~10. This is the amount of damage the weapon makes. The lethality is determined from the hit location.
- **Penetration:** 0 to ~6. This value negates armour.
- **Lethality Modifier:** -4 to +2, usually 0. Can modify the weapon to be less or more lethal.
- **Accuracy:** 1 to 7. Determines the accuracy and effective range of the weapon.
- **Shots:** 1+ Determines how many shots the weapon can fire between reloads.

### Melee Weapons

- **Damage:** 1 to ~8. This is the amount of damage the weapon makes.
- **Lethality:** Stun, Light, Moderate, Serious, Deadly. The lethality of the damage the weapon causes.
- **Quickness:** 0 to ~6. Speed and nibleness of the weapon.
- **Impact:** 0 to ~4. The force of the weapons impact.
- **Defence Bonus:** 0 to 3. The bonus to defence when using this weapon.
- **Reach:** 0 to 3. How much extra reach the weapon gives the wielder.

### Armour

- **Cover:** 1 to 6. How much of the bodypart it covers.
- **Impact:** 1 to ~5. How much impact protection the armour has.
- **Deflect Die:** None, D4, D6 or D8. Determines the die used for deflecting damage.
- **Deflect Bonus:** 0 to ~5. The bonus to the deflect roll.
