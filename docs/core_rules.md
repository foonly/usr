# USR System: Core Rules (v2.0 Draft)

## 1. Core Mechanics

### The Dice System

USR uses **D10s** for all checks. The number of dice rolled depends on the **Difficulty**, while the target number to roll lower or equal to is the character's **Trait Value**.

| Difficulty     | Dice Rolled  | Examples                                     |
| :------------- | :----------: | :------------------------------------------- |
| Routine        |      6       | Climbing a ladder                            |
| Easy           |      5       | Climbing a rope ladder                       |
| **Normal**     |    **4**     | Climbing a knotted rope (Default)            |
| Tricky         |      3       | Climbing a normal rope                       |
| Hard           |      2       | Climbing a rough stone wall                  |
| Very Hard      |      1       | Climbing a smooth wall                       |
| Extremely Hard | 2 (Negative) | Climbing an overhang (Must pass on all dice) |

- **Success:** Each die that rolls lower or equal to the Trait Value is a **success**.
- **Specialization:** If a character has an applicable Specialization, any die rolling lower or equal to the Specialization Value grants an **additional success** (effectively 2 successes for that die).
- **Critical Success:** Occurs when two or more **1s** are rolled. Each "extra" 1 (beyond the first) adds +1 success.
- **Tens (Complications):** Every **10** rolled beyond the first subtracts 1 success. If all successes are lost, the character fails.
- **Negative Difficulty:** For _Extremely Hard_ tasks, the character rolls the absolute number of dice (e.g., 2 dice for -2). To succeed, **every die** must roll $\le$ Trait Value. Success grants exactly 1 success (plus any Specialization bonuses).
- **Critical Failure:** Occurs when the number of successes goes negative (by the rule of Tens). Critical failure may not be re-rolled.

---

## 2. Character Traits

### Primary Traits

Characters are defined by several traits, ranging from 1 to 7.

- **Attributes:** Fortitude, Intelligence, Initiative, Willpower, Awareness.
- **Skills:** Mobility, Melee, Ranged, Medicine, Engineering, Charisma, Survival, Subterfuge, Animals, Craftsmanship, Naval.

### Specializations

Skills can have **Specializations**. A Specialization has its own value (max 3). When rolling a skill, if the result is also $\le$ Specialization Value, it counts as a second success for that die.

### Knowledge Skills

Knowledge is ranked as **None**, **Basic**, **Good**, or **Advanced**. These are used for specialized information checks.

### Languages

Languages are tracked for both **Speaking** and **Writing**, ranked as **None**, **Basic**, **Good**, or **Advanced**.

---

## 3. Damage & Health

### Damage Monitor

Damage is tracked in a 12-box monitor. As boxes fill, the character suffers cumulative penalties to all rolls.

| Boxes Filled | 1-2 | 3-4 | 5-6 | 7-8 | 9-10 |         11-12         |
| :----------- | :-: | :-: | :-: | :-: | :--: | :-------------------: |
| **Penalty**  |  0  | -1  | -2  | -3  |  -4  | **Incapacitated (X)** |

- **Incapacitation:** At 11+ boxes, the character is incapacitated and can no longer perform actions.

### Wound Types & Lethality

| Wound Type | Abbr. |      HP Cost to Heal      |
| :--------- | :---: | :-----------------------: |
| Stun       |   X   | 0 (Removes automatically) |
| Light      |   L   |             3             |
| Moderate   |   M   |             7             |
| Serious    |   S   |            12             |
| Deadly     |   D   |            16             |

### Resisting Damage

When taking damage, a character rolls D10s equal to the damage amount. The goal is to roll $\le$ their **Resistance** for that wound type.

- **Resistance:** Derived from **Fortitude**:
  - **Stun:** 90% of Fortitude (rounded up)
  - **Light:** 80% of Fortitude (rounded up)
  - **Moderate:** 70% of Fortitude (rounded up)
  - **Serious:** 60% of Fortitude (rounded up)
  - **Deadly:** 50% of Fortitude (rounded up)
- **Effect:** Each success reduces the damage by 1 box.

### Healing

Characters use **Healing Points (HP)** to clear damage boxes.

- **Stun:** Removed via rest or special actions (0 HP cost).
- **Other Wounds:** Cost HP equal to their Lethality (e.g., 7 HP to clear one Moderate box).
- HP is typically gained through rest (+1 for sleep, +1 for bed rest) or medical attention.

---

## 4. Fate & Chips

Characters use **Chips** (White, Green, Blue, Red, Black) to influence fate.

- **Gaining Chips:** Roll $X$ D6. If any die rolls **higher** than your current total number of chips, you gain a random chip.



---

## 5. Combat

### Position

Combat uses a **Position Monitor** (Value 0 to 5, default 4).

- **Position Utility:** Position represents tactical advantage. GMs may allow "selling" position for bonus dice or initiative. Every defense performed typically reduces position.

### Initiative

Roll dice based on stance/situation. **Add only the highest die** to your Initiative trait. Every "10" rolled beyond the first grants a +5 bonus.

### Defense

- **Melee Defense:** Stance/Skill Dice + Weapon Defense Rating - Attacker's Successes.
- **Dodge:** Skill Dice - Attacker's Successes.

---
