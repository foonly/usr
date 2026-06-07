const fields = foundry.data.fields;

/**
 * Shared fields for all Item types.
 */
class BaseItemData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			weight: new fields.NumberField({ initial: 0, min: 0 }),
			description: new fields.HTMLField({ initial: "" }),
			formula: new fields.StringField({ initial: "" }),
		};
	}
}

/**
 * Data model for generic Items.
 */
export class ItemData extends BaseItemData {
	static defineSchema() {
		return {
			...super.defineSchema(),
			quantity: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
		};
	}
}

/**
 * Data model for Melee weapons.
 */
export class MeleeData extends BaseItemData {
	static defineSchema() {
		return {
			...super.defineSchema(),
			damage: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
			specialization: new fields.StringField({ initial: "" }),
			lethality: new fields.StringField({
				initial: "light",
				choices: ["stun", "light", "moderate", "serious", "deadly"],
			}),
			quickness: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			impact: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			defenseBonus: new fields.NumberField({
				initial: 0,
				integer: true,
				min: 0,
			}),
			reach: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
		};
	}
}

/**
 * Data model for Ranged weapons.
 */
export class RangedData extends BaseItemData {
	static defineSchema() {
		return {
			...super.defineSchema(),
			damage: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
			specialization: new fields.StringField({ initial: "" }),
			accuracy: new fields.NumberField({
				initial: 1,
				integer: true,
				min: 1,
				max: 7,
			}),
			penetration: new fields.NumberField({
				initial: 0,
				integer: true,
				min: 0,
			}),
			lethalityModifier: new fields.NumberField({
				initial: 0,
				integer: true,
				min: -4,
				max: 2,
			}),
			shots: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
			reload: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
			ammo: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
		};
	}
}

/**
 * Data model for Armor.
 */
export class ArmorData extends BaseItemData {
	static defineSchema() {
		return {
			...super.defineSchema(),
			cover: new fields.NumberField({
				initial: 1,
				integer: true,
				min: 1,
				max: 6,
			}),
			impact: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
			deflectDie: new fields.StringField({
				initial: "none",
				choices: ["none", "d4", "d6", "d8"],
			}),
			deflectBonus: new fields.NumberField({
				initial: 0,
				integer: true,
				min: 0,
			}),
		};
	}
}
