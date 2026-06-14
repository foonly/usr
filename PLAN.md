# Traits, Specializations & Knowledge skills

The system now uses a completely free form system to add specializations and knowledge skills. This is very flexible, but leads to problems with inconsistent scope and difficulty to target actual specializations. It also makes it difficult to match weapon types to their specializations.

As USR is designed as a generic system that could be used in many time periods and settings we also need to build in modularity for all Traits, Specializations and knowledge skills. Some traits should always be the same, as they are core attibutes and skills. These are Fortitude, Intelligence, Initiative, Willpower, Awareness, Mobility, Melee and Ranged. But skills like Mobility, Melee and Ranged can have different specializations.

All these values should be overridable with Foundry Modules. But a this change should not break backwards compatibility for existing campaigns (all using the base values now in the system). If we make breaking changes, we need to make a conversion script that updates existing campaigns to the new system.

## Traits

These will be the same as now, but we need to make it possible for modules to change them. They can also possibly change the number of traits.

## Specialization

These should be converted from a free text version to a fixed list of specializations, but one that is easy to modify in the code, and update with modules. If posssible this could even be modified for the active world, maybe even with a UI, but this is optional. The current campaigns have a Western / Victorian theme (1860s), so we will make the base list follow that. I don't currently have a list of all possible specializations, so we need to create that, but I will list the ones we have. They don't have to follow current ones exactly, we can re-map some of the existing ones.

### Current Specializations

**Mobility**

- Stealth
- Running
- Climbing

**Melee**

- Axes
- Swords
- Knives
- Clubs

**Ranged**

- Rifles
- Pistols
- Shotguns
- Artillery
- Bows
- Thrown

**Medicine**

- First Aid
- Surgery
- Treatment
- Assesment

**Engineering**

- Architecture
- Fortifications
- Mechanics
- Chemistry

**Charisma**

- Entertainment
- Persuasion
- Leadership
- Acting
- Gambling
- Rhetoric
- Intimidation

**Animals**

- Falconry
- Riding
- Dogs
- Bison (Should probably be more generic)

**Subterfuge**

- Lockpicking
- Pickpocketing
- Blending in
- Camouflage

**Craftmanship**

- Smithing
- Carpentry
- Cooking

**Survival**

- Traps
- Tracking
- Herbology
- Hunting

**Naval**

- Navigation

## Knowledge skills

These are flavour skills, and are never directly rolled against. There are also to many potential ones to make an exhaustive list. But we would need a base list of these, fitting the theme. And a way to add more of them, either on a world level (preferred option), or per character if the world option is not possible.
