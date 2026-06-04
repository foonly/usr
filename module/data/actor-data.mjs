const fields = foundry.data.fields;

/**
 * Shared fields for all Actor types.
 */
class BaseActorData extends foundry.abstract.TypeDataModel {
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
			position: new fields.SchemaField({
				value: new fields.NumberField({ initial: 4, integer: true, min: 0, max: 5 }),
				min: new fields.NumberField({ initial: 0, integer: true }),
				max: new fields.NumberField({ initial: 5, integer: true }),
			}),
			traits: new fields.SchemaField({
				fortitude: this.traitField("Fortitude", false),
				intelligence: this.traitField("Intelligence", false),
				initiative: this.traitField("Initiative", false),
				willpower: this.traitField("Willpower", false),
				awareness: this.traitField("Awareness", false),
				mobility: this.traitField("Mobility", true),
				melee: this.traitField("Melee", true),
				ranged: this.traitField("Ranged", true),
				medicine: this.traitField("Medicine", true),
				engineering: this.traitField("Engineering", true),
				charisma: this.traitField("Charisma", true),
				survival: this.traitField("Survival", true),
				subterfuge: this.traitField("Subterfuge", true),
				animals: this.traitField("Animals", true),
				craftsmanship: this.traitField("Craftsmanship", true),
				naval: this.traitField("Naval", true),
			}),
			info: new fields.SchemaField({
				fullName: new fields.StringField({ initial: "" }),
				biography: new fields.HTMLField({ initial: "" }),
				age: new fields.StringField({ initial: "" }),
				height: new fields.StringField({ initial: "" }),
				weight: new fields.StringField({ initial: "" }),
			}),
			biography: new fields.HTMLField({ initial: "" }), // Added because it's used in prose-mirror
		};
	}

	static traitField(label, hasSpec) {
		return new fields.SchemaField({
			label: new fields.StringField({ initial: label }),
			value: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
			xp: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			roll: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
			hasSpec: new fields.BooleanField({ initial: hasSpec }),
			spec: new fields.ArrayField(
				new fields.SchemaField({
					title: new fields.StringField({ initial: "" }),
					value: new fields.NumberField({ initial: 1, integer: true, min: 1 }),
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
