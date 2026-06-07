# USR System: 1.0 reference

This is only here for historical reference. We use the 2.0 draft for the implemented system.

## 1. Core Mechanics

### The Dice System

USR uses **D10s** for all rolls. The number of dice rolled is determined by the **Difficulty**, while the target number to roll under (or equal to) is the character's **Skill Value**.

| Difficulty |  Dice Rolled   | Examples                    |
| :--------- | :------------: | :-------------------------- |
| Routine    |       6        | Climbing a ladder           |
| Easy       |       5        | Climbing a rope ladder      |
| Normal     |       4        | Climbing a knotted rope     |
| Tricky     |       3        | Climbing a normal rope      |
| Hard       |       2        | Climbing a rough stone wall |
| Very Hard  |       1        | Climbing a smooth wall      |
| Extreme    | 1 (Half Skill) | Climbing an overhang        |

- **Success:** Each die that rolls equal to or lower than the Skill Value is a **success** (or "effect").
- **Critical Success:** Occurs when two or more dice roll **1s**. Each 1 rolled provides one additional success (beyond its normal success).
- **Fumble:** Occurs when **half or more** of the dice roll **10s**. A fumble cannot be saved with Fate Points.
  - _Negative Fate:_ Every -1 Fate Point reduces the fumble threshold (e.g., at -2 Fate, 8, 9, and 10 all count toward a fumble).

### Specializations

Specializations provide additional successes when applicable:

- **Level 1:** Every **1** rolled grants +1 additional success.
- **Level 2:** Every **1 or 2** rolled grants +1 additional success.
- _Note: These are in addition to Critical Success bonuses._

---

## 2. Character Traits

### Attributes

General capabilities used for active checks.

- **Fortitude:** Physical strength and resistance.
- **Initiative:** Reaction speed and situational awareness.
- **Knowledge:** Education and memory.
- **Willpower:** Mental discipline and resolve.

### Active Skills

Specific trained abilities (Value 0–7). Skills can have **Specializations** that grant bonuses as described above.

### Knowledge Skills

Used for specialized information. The level of training determines the dice pool and skill value used:

- **None:** 1 die, Half Skill Value.
- **General:** 2 dice, Full Skill Value.
- **Skill:** 4 dice, Full Skill Value.
- **Specialization:** 6 dice, Full Skill Value.

### Languages

Languages are tracked in steps:

- **Step 0:** Basic understanding; hesitant speech.
- **Step 1:** Common fluency (standard speaker).
- **Step 2:** Advanced fluency (scholarly/noble).
- _Read/Write is tracked separately with similar levels._

---

## 3. Movement & Encumbrance

### Running & Speed

A character’s base speed is calculated from **Mobility** and **Fortitude**.

- **Running:** A "Routine" (6 dice) Mobility check. Failure forces a Jog for 1 turn before retrying.
- **Pace:** Successes (Effect) determine how long a pace can be maintained (Full speed = 1 min, Walk = 2 hours, etc.).

### Encumbrance (Carry Units - CU)

Weight and bulk are tracked as CU. Limits are based on **Fortitude**.

- **Wear:** Armor and clothing worn on the body.
- **Carry:** Items in bags or on belts.
- **Modifiers:** High CU levels apply penalties to **Mobility** (physical movement), **Speed** (top velocity), and **Action** (combat and physical tasks).

---

## 4. Damage & Healing

### Damage Monitor

Damage is tracked in 10 boxes.

- **Incapacitation:** Each box filled applies a cumulative penalty to skill dice (Step 1-2: -1; Step 9: -5; Step 10: -6).
- **Thresholds:** At 6 boxes, a character is "slightly incapacitated" (GM may require rolls for routine tasks). At 8 boxes, they are "generally incapacitated" (only simple actions allowed).

### Resisting Damage

When hit, roll dice equal to **half the damage** received (round up).

- **Under "High" Resistance:** Reduce the damage lethality by 1 step.
- **Under "Low" Resistance:** Remove 1 box of damage entirely.

### Lethality & Death

| Wound Type | Abbr. | Lethality | Death Check       |
| :--------- | :---: | :-------: | :---------------- |
| Unarmed    |   X   |     0     | -                 |
| Light      |   L   |     1     | -                 |
| Moderate   |   M   |     2     | -                 |
| Serious    |   S   |     4     | 6 Damage (6 Dice) |
| Deadly     |   D   |     6     | 6 Damage (4 Dice) |

- **Death Check:** Triggered by 6+ Serious/Deadly damage in one hit. Roll dice (modified by damage exceeding 6) against Resistance. Failure = Instant Death.

### Healing

- **Health Checks:** After combat, roll 2D10 + Total Lethality on the **Health Table** to determine First Aid/Treatment requirements.
- **First Aid:** Performed every 5 mins. Failure to meet successes within the timeframe worsens the condition.
- **Healing Points (HP):** Used to remove damage boxes. HP Cost = Lethality Value of the wound.
  - 1 HP per night's sleep; +1 for rest; +1 for medical attention.

---

## 5. Combat

### Position & Stances

Combat uses a **Position Monitor** (Superior to Worst) and **Stances**:

| Stance    | Initiative | Defense | Movement         |
| :-------- | :--------: | :-----: | :--------------- |
| Offensive |   6 Dice   | 3 Dice  | 2x Combat Move   |
| Neutral   |   4 Dice   | 5 Dice  | 1x Combat Move   |
| Defensive |   2 Dice   | 7 Dice  | 0.5x Combat Move |

- **Position Utility:** You can "sell" Position for +1 die on a roll or +3 Initiative. You can "buy" Position with -2 Initiative.

### Initiative

Roll dice based on Stance. **Add only the highest die** to your Initiative trait.

- **Bonus:** Every **10** rolled beyond the first grants a **+5** bonus.

### Defense

- **Melee Defense:** Stance Dice + Weapon Defense Rating (DR) - Attacker's Successes.
- **Dodge:** Stance Dice - Attacker's Successes. (Can be used against ranged).
- _Note: Every defense performed reduces Position by 1._

### Weapons & Armor

- **Cover:** Quickness vs. Armor Cover. Difference is a dice penalty to the attack. Success = Full damage.
- **Impact:** Damage - Armor Impact = Damage through.
- **Piercing:** Piercing Value vs. (Deflection + 1D10).

### Hit Locations (Melee & Ranged)

Roll 2D10. Targeting specific locations imposes a **Dice Cost** penalty to the attack but modifies **Lethality**.

---

## 6. Character Generation

1.  **Traits:** Roll **5 groups of 4** (2D10 on the Trait Table). Keep 4 groups, discard 1. Assign to 12 Skills and 4 Attributes.
2.  **Knowledge Points:** Based on Knowledge trait (8 to 28 points). Spend on Knowledge Skills and Languages (1 point per step).
3.  **Finishing Points:** 5 points to tweak:
    - **Trait Increase:** Cost = New Value.
    - **Spec/Knowledge/Language:** 1 point per dot.
4.  **Secondary Stats:**
    - **Handedness:** 2D10 (2-13 Right, 14-18 Left, 19-20 Ambi).
    - **Dodge Value:** (Initiative + Mobility) / 2.
    - **Combat Speed:** (Mobility + Melee) / 2.
    - **Resistance:** Derived from Fortitude.

---

## 7. Advancement

- **Experience (Expo) Rolls:** Awarded by GM or on Criticals/Fumbles.
- **Increasing Traits:** Need 5 Expo dots. Roll 2D10; both must be > (Current Value × 2 + 5).
- **Increasing Specs:** Need 3 Expo dots. 1D10 must be > (Skill + Spec).
- **Knowledge Skills:** Need 10 Expo dots. 2D10 must be ≥ Learning Value.

---

## 8. Reference Tables

### Trait Value Table (2D10)

| Roll  | Trait 1 | Trait 2 | Trait 3 | Trait 4 |
| :---: | :-----: | :-----: | :-----: | :-----: |
|  2-3  |    6    |    3    |    1    |    1    |
|  4-6  |    3    |    3    |    3    |    2    |
|  7-9  |    5    |    2    |    2    |    2    |
| 10-12 |    4    |    3    |    2    |    2    |
| 13-15 |    4    |    4    |    2    |    1    |
| 16-18 |    5    |    3    |    2    |    1    |
|  19   |    6    |    2    |    2    |    1    |
|  20   |    7    |    2    |    1    |    1    |

### Damage Monitor & Penalties

| Box         |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  | 10  |
| :---------- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **Penalty** | -1  | -1  | -2  | -2  | -3  | -3  | -4  | -4  | -5  | -6  |

### Resistance Table (Derived from Fortitude)

| Fortitude | Low | High |
| :-------: | :-: | :--: |
|     1     |  0  |  5   |
|     2     |  1  |  5   |
|     3     |  1  |  6   |
|     4     |  2  |  6   |
|     5     |  2  |  7   |
|     6     |  3  |  7   |
|     7     |  3  |  8   |

### Health Table (2D10 + Total Lethality)

|  Total   | First Aid (Success/Time) | Treatment (Success/Time) |
| :------: | :----------------------- | :----------------------- |
| Up to 20 | None                     | None                     |
|  21-25   | 1 / 20 min               | 1 / 5 h                  |
|  26-30   | 2 / 20 min               | 1 / 4 h                  |
|  31-35   | 2 / 15 min               | 2 / 4 h                  |
|  36-40   | 3 / 15 min               | 2 / 3 h                  |
|  41-45   | 3 / 10 min               | 3 / 3 h                  |
|  46-50   | 4 / 10 min               | 3 / 2 h                  |
|  51-55   | 4 / 5 min                | 4 / 2 h                  |
|  56-60   | 5 / 5 min                | 4 / 1 h                  |
|   61+    | 6 / 5 min                | 5 / 1 h                  |

### Melee Hitlocation Table (2D10)

| Roll  | Location | Dice Cost | Lethality |
| :---: | :------- | :-------: | :-------: |
|   2   | Head A   |    -3     |    +2     |
|   3   | Head B   |    -3     |    +1     |
|   4   | Arms A   |    -2     |    -1     |
|  5-7  | Arms B   |    -2     |    -2     |
| 8-12  | Torso A  |    -1     |    +0     |
| 13-14 | Torso B  |    -1     |    -1     |
| 15-18 | Legs B   |    -2     |    -2     |
| 19-20 | Legs A   |    -2     |    -1     |

### Ranged Hitlocation Table (2D10)

| Roll  | Location | Dice Cost |  Lethality   |
| :---: | :------- | :-------: | :----------: |
|   2   | Head A   |    -3     |  D (Deadly)  |
|   3   | Head B   |    -3     | S (Serious)  |
|   4   | Arms A   |    -2     | M (Moderate) |
|  5-7  | Arms B   |    -2     |  L (Light)   |
| 8-12  | Torso A  |    -1     | S (Serious)  |
| 13-14 | Torso B  |    -1     |  L (Light)   |
| 15-18 | Legs B   |    -2     |  L (Light)   |
| 19-20 | Legs A   |    -2     | M (Moderate) |

### Learning Value Table (Based on Knowledge)

| Knowledge | Easy | Medium | Hard |
| :-------: | :--: | :----: | :--: |
|     1     |  13  |   16   |  18  |
|     2     |  11  |   14   |  16  |
|     3     |  10  |   13   |  15  |
|     4     |  9   |   12   |  14  |
|     5     |  8   |   11   |  13  |
|     6     |  7   |   10   |  12  |
|     7     |  6   |   8    |  10  |

### Carry Units (CU) Thresholds (By Fortitude)

| Step | F1  | F2  | F3  | F4  | F5  | F6  | F7  |
| :--: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|  1   |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  2   |  2  |  3  |  3  |  4  |  4  |  5  |  5  |
|  3   |  6  |  8  | 10  | 11  | 12  | 13  | 14  |
|  4   | 11  | 13  | 15  | 17  | 19  | 21  | 23  |
|  5   | 16  | 20  | 22  | 24  | 26  | 29  | 32  |
|  6   | 22  | 27  | 31  | 34  | 37  | 41  | 45  |
|  7   | 30  | 36  | 42  | 47  | 52  | 57  | 63  |

**CU Modifiers (Apply at each Step):**

- **Step 1-2:** Mobility +1.
- **Step 3:** Mobility -1.
- **Step 4:** Mobility -2, Speed -1.
- **Step 5:** Mobility -3, Speed -2, Action -1.
- **Step 6:** Mobility -4, Speed -3, Action -2 (Wear: Action -1).
- **Step 7:** Mobility -5, Speed -4, Action -3 (Wear: Action -1).

### Normal Range Table

| Accuracy | Point Blank (6D) | Short (4D) | Medium (3D) | Long (2D) | Very Long (1D) |
| :------: | :--------------: | :--------: | :---------: | :-------: | :------------: |
|    1     |        2         |     5      |     15      |    20     |       30       |
|    2     |        3         |     7      |     20      |    33     |       55       |
|    3     |        4         |     10     |     25      |    45     |       80       |
|    4     |        4         |     13     |     35      |    60     |      110       |
|    5     |        4         |     15     |     45      |    75     |      130       |

### Aimed Range Table

| Accuracy | PB (6D/Aim 1) | Short (4D/Aim 1) | Medium (3D/Aim 2) | Long (2D/Aim 3) | V. Long (1D/Aim 4) |
| :------: | :-----------: | :--------------: | :---------------: | :-------------: | :----------------: |
|    1     |      15       |        30        |        45         |       65        |         90         |
|    2     |      20       |        40        |        65         |       95        |        120         |
|    3     |      25       |        50        |        90         |       140       |        180         |
|    4     |      30       |        60        |        100        |       190       |        350         |
|    5     |      35       |        70        |        130        |       240       |        500         |
|    6     |      40       |        80        |        150        |       300       |        700         |
|    7     |      50       |       100        |        180        |       400       |        900         |
