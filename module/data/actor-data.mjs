const fields = foundry.data.fields;

/**
 * Shared fields for all Actor types.
 */
class BaseActorData extends foundry.abstract.TypeDataModel {
	/** @override */
	static migrateData(source) {
		const skillTraitKeys = [
			"medicine",
			"engineering",
			"charisma",
			"survival",
			"subterfuge",
			"animals",
			"craftsmanship",
			"naval",
		];

		// Helper to migrate specializations to slugs
		const migrateSpecs = (traitKey, trait) => {
			if (!trait?.spec || !Array.isArray(trait.spec)) return;
			const specConfig = CONFIG.usr.specializations[traitKey];
			if (!specConfig) return;

			trait.spec.forEach((s) => {
				if (!s.title) return;
				const title = s.title.trim().toLowerCase();

				// 1. If title is already a valid slug (case-insensitive check)
				if (specConfig[title]) {
					if (s.title !== title) {
						console.log(`USR | Normalizing spec slug: ${s.title} -> ${title}`);
						s.title = title;
					}
					return;
				}

				// 2. Try to find a slug that matches the localized label
				for (const [slug, labelKey] of Object.entries(specConfig)) {
					const label = game.i18n.localize(labelKey).trim().toLowerCase();
					if (title === label) {
						console.log(
							`USR | Migrating spec name to slug: ${s.title} -> ${slug}`,
						);
						s.title = slug;
						return;
					}
				}
			});
		};

		if (source.traits) {
			source.skillTraits ??= {};
			for (const key of skillTraitKeys) {
				// If the trait exists in the raw source 'traits' object
				if (source.traits[key]) {
					// Move it to skillTraits if it's not already there or if existing is incomplete
					if (!source.skillTraits[key] || !source.skillTraits[key].value) {
						source.skillTraits[key] = {
							label: `USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`,
							value: 1,
							xp: 0,
							roll: 0,
							hasSpec: true,
							spec: [],
							...foundry.utils.deepClone(source.traits[key] || {}),
							...foundry.utils.deepClone(source.skillTraits[key] || {}),
						};
						console.log(`USR | Migrating/Fixing ${key} from source traits`);
					}

					// Ensure label is localized key
					if (
						typeof source.skillTraits[key].label === "string" &&
						!source.skillTraits[key].label.startsWith("USR.")
					) {
						source.skillTraits[key].label = `USR.Trait${
							key.charAt(0).toUpperCase() + key.slice(1)
						}`;
					}

					// Migrate specs for this skill trait
					migrateSpecs(key, source.skillTraits[key]);

					// Remove from original traits object to prevent schema validation issues
					delete source.traits[key];
				} else if (source.skillTraits[key]) {
					// It's already in skillTraits, but we might still need to fix incomplete data
					if (
						!source.skillTraits[key].value ||
						!source.skillTraits[key].label
					) {
						source.skillTraits[key] = {
							label: `USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`,
							value: 1,
							xp: 0,
							roll: 0,
							hasSpec: true,
							spec: [],
							...source.skillTraits[key],
						};
					}
					migrateSpecs(key, source.skillTraits[key]);
				}
			}
		}

		// Update core trait labels and migrate specs
		if (source.traits) {
			const coreKeys = [
				"fortitude",
				"intelligence",
				"initiative",
				"willpower",
				"awareness",
				"mobility",
				"melee",
				"ranged",
			];
			for (const key of coreKeys) {
				if (source.traits[key]) {
					if (
						typeof source.traits[key].label === "string" &&
						!source.traits[key].label.startsWith("USR.")
					) {
						source.traits[key].label =
							`USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`;
					}
					// Migrate specs for this core trait
					migrateSpecs(key, source.traits[key]);
				}
			}
		}

		return super.migrateData(source);
	}

	static defineSchema() {
		return {
			health: new fields.SchemaField({
				d: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				s: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				m: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				l: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				x: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				hp: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				status: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			}),
			blood: new fields.SchemaField({
				value: new fields.NumberField({ initial: 4, integer: true, min: 0 }),
			}),
			bleeding: new fields.StringField({
				initial: "none",
				choices: ["none", "low", "medium", "high"],
			}),
			position: new fields.SchemaField({
				value: new fields.NumberField({
					initial: 4,
					integer: true,
					min: 0,
					max: 5,
				}),
				min: new fields.NumberField({ initial: 0, integer: true }),
				max: new fields.NumberField({ initial: 5, integer: true }),
			}),
			traits: new fields.SchemaField({
				fortitude: this.traitField("USR.TraitFortitude", false),
				intelligence: this.traitField("USR.TraitIntelligence", false),
				initiative: this.traitField("USR.TraitInitiative", false),
				willpower: this.traitField("USR.TraitWillpower", false),
				awareness: this.traitField("USR.TraitAwareness", false),
				mobility: this.traitField("USR.TraitMobility", true),
				melee: this.traitField("USR.TraitMelee", true),
				ranged: this.traitField("USR.TraitRanged", true),
			}),
			skillTraits: new fields.ObjectField({ initial: {} }),
			info: new fields.SchemaField({
				fullName: new fields.StringField({ initial: "" }),
				biography: new fields.HTMLField({ initial: "" }),
				age: new fields.StringField({ initial: "" }),
				height: new fields.StringField({ initial: "" }),
				weight: new fields.StringField({ initial: "" }),
			}),
			biography: new fields.HTMLField({ initial: "" }), // Added because it's used in prose-mirror
			contacts: new fields.ArrayField(
				new fields.SchemaField({
					name: new fields.StringField({ initial: "" }),
					type: new fields.StringField({
						initial: "individual",
						choices: ["individual", "group"],
					}),
					level: new fields.NumberField({
						initial: 0,
						integer: true,
						min: 0,
						max: 3,
					}),
					shortDescription: new fields.StringField({ initial: "" }),
					details: new fields.StringField({ initial: "" }),
				}),
				{ initial: [] },
			),
		};
	}

	static traitField(label, hasSpec) {
		return new fields.SchemaField({
			label: new fields.StringField({ initial: label }),
			value: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
			modifier: new fields.NumberField({ initial: 0, integer: true }),
			xp: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			roll: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			hasSpec: new fields.BooleanField({ initial: hasSpec }),
			spec: new fields.ArrayField(
				new fields.SchemaField({
					title: new fields.StringField({ initial: "" }),
					value: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
					modifier: new fields.NumberField({ initial: 0, integer: true }),
					xp: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
					roll: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				}),
				{ initial: [] },
			),
		});
	}
}

/**
 * Data model for Characters.
 */
export class CharacterData extends BaseActorData {
	static defineSchema() {
		return {
			...super.defineSchema(),
			xp: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			languages: new fields.ArrayField(
				new fields.SchemaField({
					name: new fields.StringField({ initial: "" }),
					speak: new fields.NumberField({ initial: 0, integer: true }),
					write: new fields.NumberField({ initial: 0, integer: true }),
				}),
				{ initial: [] },
			),
			knowledge: new fields.ArrayField(
				new fields.SchemaField({
					name: new fields.StringField({ initial: "" }),
					level: new fields.NumberField({ initial: 0, integer: true }),
					approved: new fields.BooleanField({ initial: true }),
				}),
				{ initial: [] },
			),
			assets: new fields.ArrayField(
				new fields.SchemaField({
					name: new fields.StringField({ initial: "" }),
					amount: new fields.StringField({ initial: "" }),
				}),
				{ initial: [] },
			),
			chips: new fields.SchemaField({
				white: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				green: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				blue: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				red: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
				black: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			}),
		};
	}
}

/**
 * Data model for NPCs.
 */
export class NpcData extends BaseActorData {}
