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

---

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

---

## Damage & Health

### Damage Monitor

Physical injuries are tracked using a 12-box monitor. As these boxes fill, the character accumulates severe physical strain, resulting in cumulative penalties applied to all trait rolls.

| Boxes Filled     | 1–2 | 3–4 | 5–6 | 7–8 | 9–10 | 11–12                 |
| ---------------- | --- | --- | --- | --- | ---- | --------------------- |
| **Dice Penalty** | 0   | -1  | -2  | -3  | -4   | **Incapacitated (X)** |

- **Incapacitation:** At 11 or more filled boxes, the character becomes fully incapacitated and can no longer perform any physical or mental actions.

- **Lesser Damage Displacement:** Lesser wound types marked on the monitor are pushed off or overwritten when the character sustains more severe wounds. However, the total cumulative penalties from the filled boxes apply regardless of what wound types occupy them.

---

### Wound Types & Lethality

Attacks inflict specific categories of wounds, which determine how difficult they are to heal using resources.

| Wound Type   | Abbr. | HP Cost to Heal                    | Trauma Modifier |
| ------------ | ----- | ---------------------------------- | --------------- |
| **Stun**     | X     | 0 (Removes automatically via rest) | —               |
| **Light**    | L     | 3 HP                               | —               |
| **Moderate** | M     | 7 HP                               | +0              |
| **Serious**  | S     | 12 HP                              | +4              |
| **Deadly**   | D     | 16 HP                              | +8              |

---

### Resisting Damage

When a character takes damage, they attempt to shrug off the worst of the physical impact before marking boxes on their Damage Monitor.

- **The Roll:** Roll a number of **D10s** equal to the incoming damage amount. The target number is the character's **Resistance** value for that specific wound tier.

- **Resistance Values:** These values are derived from the character's **Fortitude** attribute:

- _Stun Resistance:_ 90% of Fortitude (rounded up)

- _Light Resistance:_ 80% of Fortitude (rounded up)

- _Moderate Resistance:_ 70% of Fortitude (rounded up)

- _Serious Resistance:_ 60% of Fortitude (rounded up)

- _Deadly Resistance:_ 50% of Fortitude (rounded up)

- **Effect:** Each individual success rolled reduces the incoming damage by 1 box. Any remaining unresisted damage is marked on the Damage Monitor starting from the lowest open box.

---

### The Blood Pool & Shock

While the Damage Monitor tracks superficial and structural trauma, the **Blood Pool** tracks systemic vitality, circulatory volume, and internal wellness.

- **Max Blood Pool Capacity:** A character's maximum Blood Pool capacity is determined directly by their baseline physical constitution, calculated using their **Fortitude** attribute:

$$\text{Max Blood Pool} = 4 + (2 \times \text{Fortitude})$$

- **Systemic Death:** If a character's Blood Pool is drained to **0**, they immediately expire from blood loss, organ failure, or systemic shock.
- **Hypovolemic Shock Threshold:** If a character loses **2/3 or more** of their maximum Blood Pool capacity, their body enters acute shock.
- _Consciousness Check:_ The character must pass a standard **Willpower check** (Normal Difficulty, 4 dice) at the start of every combat round to remain conscious.

- _Falter Modifier:_ Due to severe weakness, any physical task requires 1 fewer success than normal to completely fail, meaning complications from rolling Tens trigger much faster.

---

### Trauma Checks

Sustaining significant physical injury risks immediate physical shock, severe hemorrhaging, or permanent impairment. A **Trauma Check** is triggered immediately whenever a character suffers a **Moderate (M), Serious (S), or Deadly (D)** wound and takes at least 1 box of unresisted damage past their Resistance roll.

- **The Roll:** Roll **2D10** and add the following modifiers:
- **+ Net Damage:** Add the exact number of damage boxes actually marked on the monitor from this hit.

- **+ Wound Modifier:** Add the corresponding modifier based on the initial severity of the attack: Moderate (+0), Serious (+4), or Deadly (+8).

### The Trauma Table

| Total Roll   | Narrative Result         | Immediate Mechanical Effect                                                                                                                                                                | Systemic Bleeding Status |
| ------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| **Up to 10** | **Glancing Blow**        | Shaken. No additional mechanical penalties.                                                                                                                                                | No Bleeding              |
| **11–13**    | **Faltering Pain**       | Must pass a **Willpower check** (Normal, 4 dice) or drop to the _Worst_ position on the combat monitor.                                                                                    | No Bleeding              |
| **14–15**    | **Flesh Wound**          | The injury cuts deep into soft tissue but misses vitals.                                                                                                                                   | **Low Bleeding**         |
| **16–17**    | **Grizzled Scar**        | Bleeds heavily. The character gains a prominent, permanent narrative scar across the impacted hit location.                                                                                | **Medium Bleeding**      |
| **18–19**    | **Blunt Trauma**         | The blow cracks skeletal structures or severely bruises internal systems. Drop prone and lose your next main action.                                                                       | **Low Bleeding**         |
| **20–22**    | **Bone Fracture**        | A bone is cracked, shattered, or dislocated. The character suffers a permanent minor impairment to a skill (See _Trauma Sub-Table_).                                                       | **Low Bleeding**         |
| **23–25**    | **Arterial Gash**        | A major blood vessel is severed. The character immediately falls prone from sudden fluid loss.                                                                                             | **High Bleeding**        |
| **26–28**    | **Traumatic Knockout**   | The character is instantly knocked unconscious. They may attempt a **Willpower check** (Hard, 2 dice) at the start of each round to wake up.                                               | **Medium Bleeding**      |
| **29–31**    | **Severe Nerve Injury**  | Brutal trauma to the skull, spine, or nervous system. The character falls unconscious and permanently loses 1 point from a mental or sensory attribute (See _Trauma Sub-Table_).           | **Low Bleeding**         |
| **32–34**    | **Catastrophic Maiming** | Complete destruction or mangling of a limb or organ. The character falls unconscious and permanently loses 1 point from a physical attribute and a related skill (See _Trauma Sub-Table_). | **High Bleeding**        |
| **35+**      | **Death's Door**         | The character collapses into a comatose state. They instantly lose 1D4 Blood Points from their pool right now.                                                                             | **High Bleeding**        |

---

### The Three Bleeding Levels & Triage

Bleeding represents ongoing fluid loss that actively depletes the character's Blood Pool over time.

- **Low Bleeding:** The character loses **1 Blood Point every hour**.
- _Triage:_ Requires an **Easy (5 dice) Medicine check** to completely stop.

- **Medium Bleeding:** The character loses **1 Blood Point every minute** (or every 12 combat rounds).

- _Triage:_ Requires a **Normal (4 dice) Medicine check** to reduce to _Low Bleeding_.

- **High Bleeding:** The character loses **1 Blood Point at the end of every combat round**.

- _Triage:_ Requires a **Tricky (3 dice) Medicine check** to reduce to _Medium Bleeding_.

> Note: An ally performing emergency triage can intentionally increase the difficulty of their Medicine check by one step (e.g., transforming a Normal check into a Tricky check) to completely stabilize a wound and bypass the intermediate levels entirely.

---

### Hit Location Trauma Sub-Table

When the Trauma Table results in a permanent scar, fracture, nerve injury, or maiming blow, the specific attribute or skill reduced is dictated by the **Hit Location** targeted by the initial attack:

#### Head (Locations: Head A, Head B)

- **Grizzled Scar:** Facial disfigurement. Permanently lose **-1 to Charisma**. However, the character gains a +1 bonus success whenever using _Charisma_ for intimidation or interrogation tasks.

- **Bone Fracture:** Fractured jaw, orbital bone, or severe concussion. Permanently lose **-1 to Awareness**.

- **Severe Nerve Injury:** Traumatic brain injury. Permanently lose **-1 to Intelligence or Willpower** (player's choice).

- **Catastrophic Maiming:** Destroyed sensory organ or crushed skull. Permanently lose **-1 to Awareness** and **-1 to Intelligence**.

#### Arms (Locations: Arms A, Arms B)

- **Grizzled Scar:** Jagged, deep scar along the limb. Purely narrative; no mechanical penalty.

- **Bone Fracture:** Poorly set bone or shattered joint. Permanently lose **-1 to one manual Skill** tied directly to that arm (e.g., _Melee_, _Ranged_, _Craftsmanship_, _Engineering_, or _Medicine_).

- **Severe Nerve Injury:** Chronic tremors or loss of fine motor control. Permanently lose **-1 to Initiative**.

- **Catastrophic Maiming:** Amputated, crushed, or fully paralyzed arm. Permanently lose **-1 to Initiative** and suffer a permanent -2 success penalty to all manual skill checks attempting to utilize that arm.

#### Torso (Locations: Torso A, Torso B, Torso C)

- **Grizzled Scar:** Wide, prominent scar across the chest or back. Purely narrative; no mechanical penalty.

- **Bone Fracture:** Malformed rib cage or restrictive scar tissue limiting respiration. Permanently lose **-1 to Mobility**.

- **Severe Nerve Injury:** Deep internal trauma or spinal nerve damage causing chronic pain. Permanently lose **-1 to Willpower**.

- **Catastrophic Maiming:** Internal organ destruction or severe structural spinal deformation. Permanently lose **-1 to Fortitude** (dynamically shrinking maximum Blood Pool capacity by 2 points).

#### Legs (Locations: Legs A, Legs B)

- **Grizzled Scar:** Deep scar tissue along the thigh or calf. Purely narrative; no mechanical penalty.

- **Bone Fracture:** Shattered knee or ankle resulting in a permanent, pronounced limp. Permanently lose **-1 to Mobility**.

- **Severe Nerve Injury:** Sciatic nerve damage or localized motor deficits. Permanently lose **-1 to Initiative**.

- **Catastrophic Maiming:** Severely crippled or entirely missing leg. Permanently lose **-1 to Fortitude** and **-1 to Mobility**. Top running speed capabilities are permanently halved.

---

### Healing

Characters use **Healing Points (HP)** to clear damage boxes.

- **Other Wounds:** Cost HP equal to their Lethality (e.g., 7 HP to clear one Moderate box).
- HP is typically gained through rest (+1 for sleep, +1 for bed rest) or medical attention.

---

### Healing & Recovery

- **Stun:** Removed via rest or special actions (0 HP cost).

- **Blood Pool Recovery:** While a character is completely free of any active Bleeding Levels, they regain **1 Blood Point** per night of full sleep (+2 Blood Points if resting under the active care of someone utilizing the _Medicine_ skill).

- **Wound Recovery:** The body cannot mend deep structural wounds while it is suffering from blood loss. A character's Blood Pool must be completely full before they can spend accumulated **Healing Points (HP)** to clear damage boxes off their 12-box Damage Monitor. HP costs remain equal to the lethality of the wound box being cleared.

### Fate Chip Mitigation: The Red Chip

A character can spend their collected **Red Chips** to directly alter fate and cheat death via two distinct methods:

- **Option A: Negate Trauma Roll (Instant Mitigation):** When a character suffers a Moderate, Serious, or Deadly wound, they may instantly expend a Red Chip _before_ rolling on the Trauma Table. The physical damage boxes are still fully marked on their 12-box monitor, but the Trauma Roll is entirely skipped. No bleeding, knockouts, or permanent injuries occur.

- **Option B: Adrenaline Clench (Emergency Stabilization):** An actively bleeding character can spend a Red Chip during their turn to immediately compress their wounds through pure adrenaline or improvised physical pressure. Doing so instantly reduces their current systemic Bleeding Level by one step (e.g., High becomes Medium, or Medium becomes Low) without requiring a skill roll or an action. Spending a Red Chip while suffering from Low Bleeding completely stops the hemorrhage.

---

## Fate & Fate Chips

Characters use **Chips** (White, Green, Blue, Red, Black) to influence fate.

- **Gaining Chips:** Roll $X$ D6. If any die rolls **higher** than your current total number of chips, you gain a random chip.

How the chips are used is up to every group, feel free to define your own effects for them. But below are some examples:

- **White:** Re-roll your last roll.
- **Green:** Re-roll your last roll with an extra die, but only one success counts.
- **Blue:** Roll an additional die if adding to an completed roll. Or two additional dice if adding to an upcoming roll.
- **Red:** Negate taken damage.
- **Black:** Gain position. In combat your position monitor is maxed out. Outside of combat, the GM will decide the effect.
