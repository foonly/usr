# USR System: Core Rules (v2.0 Draft)

## Core Mechanics

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

## Character Traits

### Primary Traits

Characters are defined by several traits, ranging from 1 to 7.

- **Attributes:** Fortitude, Intelligence, Initiative, Willpower, Awareness.
- **Skills:** Mobility, Melee, Ranged, Medicine, Engineering, Charisma, Survival, Subterfuge, Animals, Craftsmanship, Naval.

### Specializations

Skills can have **Specializations**. A Specialization has its own value (max 3, and must be under the skill value). When rolling a skill, if the result is also lower or equal to the Specialization Value, it counts as a second success for that die.

### Knowledge Skills

Knowledge is ranked as **None**, **Basic**, **Good**, or **Advanced**. These are used for specialized information checks.

### Languages

Languages are tracked for both **Speaking** and **Writing**, ranked as **None**, **Basic**, **Good**, or **Advanced**.

## Fate & Fate Chips

Characters use **Chips** (White, Green, Blue, Red, Black) to influence fate.

- **Gaining Chips:** Roll $X$ D6. If any die rolls **higher** than your current total number of chips, you gain a random chip.

How the chips are used is up to every group, feel free to define your own effects for them. But below are some examples:

- **White:** Re-roll your last roll.
- **Green:** Re-roll your last roll with an extra die, but only one success counts.
- **Blue:** Roll an additional die if adding to an completed roll. Or two additional dice if adding to an upcoming roll.
- **Red:** Negate taken damage.
- **Black:** Gain position. In combat your position monitor is maxed out. Outside of combat, the GM will decide the effect.

## Encumbrance

The encumbrance system is completely optional, and if playing as pen & paper, only recommended as a guideline, since it's way too much calculation for a very small detail gain. However in Foundry everything is calculated automatically.

The system uses lbs as the weight unit for everything. Both because of being more logical in historical settings, and because it's a smaller unit so that we can define most weights as integers.

In foundry, different modules can change the diplayed weights to kg or anything else.

The encumbrance system counts the weights of worn items as 50%, and assumes weapons and other items are packed in proper carrying rigs, so they are counted as 75%. Weight not packed properly would be counted as 100%.

The base number for carrying capacity is calculated as 10 + 4 * Fortitude. Modifiers are then assigned according to the table below.

| Base Factor | Mobility | General |
| ----------- | -------- | ------- |
| 1           | -1       | 0       |
| 2           | -2       | 0       |
| 3           | -3       | 0       |
| 4           | -3       | -1      |
