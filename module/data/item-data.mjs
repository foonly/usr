const fields = foundry.data.fields;

/**
 * Shared fields for all Item types.
 */
class BaseItemData extends foundry.abstract.TypeDataModel {
	/** @override */
	static migrateData(source) {
		// Migrate specialization strings to slugs for Melee and Ranged
		if (
			(source.type === "melee" || source.type === "ranged") &&
			source.system?.specialization
		) {
			const spec = source.system.specialization.toLowerCase();
			const specConfig = CONFIG.usr.specializations[source.type];

			// If it's already a slug or known config, we're good
			if (specConfig && !specConfig[spec]) {
				// Try to find a slug that matches the localized name
				for (const [slug, labelKey] of Object.entries(specConfig)) {
					const label = game.i18n.localize(labelKey).toLowerCase();
					if (spec === label) {
						source.system.specialization = slug;
						break;
					}
				}
			}
		}
		return super.migrateData(source);
	}

	static defineSchema() {
		return {
			weight: new fields.NumberField({ initial: 0, min: 0 }),
			description: new fields.HTMLField({ initial: "" }),
			formula: new fields.StringField({ initial: "" }),
			equipped: new fields.BooleanField({ initial: false }),
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
			locations: new fields.SchemaField({
				head: new fields.BooleanField({ initial: false }),
				torso: new fields.BooleanField({ initial: false }),
				arms: new fields.BooleanField({ initial: false }),
				legs: new fields.BooleanField({ initial: false }),
			}),
		};
	}
}
