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
			type: new fields.StringField({ initial: "x" }),
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
			accuracy: new fields.NumberField({ initial: 1, integer: true }),
			penetration: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			shots: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
			reload: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			ammo: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
		};
	}
}

/**
 * Data model for Armor.
 */
export class ArmorData extends BaseItemData {}
