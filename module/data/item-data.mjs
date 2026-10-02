import { usr } from "../helpers/config.mjs";

const fields = foundry.data.fields;

/**
 * Shared fields for all Item types.
 */
class BaseItemData extends foundry.abstract.TypeDataModel {
	/**
	 * Migrate a weapon's specialization from its localized name to its slug.
	 * migrateData only receives the system data, so the caller passes the type.
	 * @param {object} source         The item's system source data
	 * @param {string} weaponType     "melee" or "ranged"
	 */
	static migrateSpecialization(source, weaponType) {
		if (typeof source.specialization !== "string" || !source.specialization) {
			return;
		}
		const spec = source.specialization.toLowerCase();
		const specConfig = CONFIG.usr?.specializations?.[weaponType];

		// If it's already a slug or there's no config, we're good
		if (!specConfig || specConfig[spec]) return;

		// Try to find a slug that matches the localized name
		for (const [slug, labelKey] of Object.entries(specConfig)) {
			const label = game.i18n.localize(labelKey).toLowerCase();
			if (spec === label) {
				source.specialization = slug;
				return;
			}
		}
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
	/** @override */
	static migrateData(source) {
		this.migrateSpecialization(source, "melee");
		return super.migrateData(source);
	}

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
	/** @override */
	static migrateData(source) {
		this.migrateSpecialization(source, "ranged");
		return super.migrateData(source);
	}

	static defineSchema() {
		return {
			...super.defineSchema(),
			damage: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
			specialization: new fields.StringField({ initial: "" }),
			accuracy: new fields.NumberField({
				initial: 1,
				integer: true,
				min: 0,
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
			magazine: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			reload: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
			ammo: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
			burst: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			fireMode: new fields.StringField({
				initial: "single",
				choices: ["single", "burst", "auto"],
			}),
		};
	}
}

/**
 * Data model for Armor.
 */
export class ArmorData extends BaseItemData {
	/** @override */
	get minDeflection() {
		const bonus = this.deflectBonus ?? 0;
		return bonus + (this.deflectDie === "none" ? 0 : 2);
	}

	/** @override */
	get maxDeflection() {
		const dieValue = usr.deflectDieMaxValues[this.deflectDie] ?? 0;
		const bonus = this.deflectBonus ?? 0;
		return bonus + 2 * dieValue;
	}

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
				choices: Object.keys(usr.deflectDice),
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
