import { usr } from "../helpers/config.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class usrActor extends Actor {
	/** @override */
	prepareBaseData() {
		super.prepareBaseData();
	}

	/**
	 * @override
	 * Augment the basic actor data with additional dynamic data. Typically,
	 * you'll want to handle most of your calculated/derived data in this step.
	 * Data calculated in this step should generally not exist in template.json
	 * (such as ability modifiers rather than ability scores) and should be
	 * available both inside and outside of character sheets (such as if an actor
	 * is queried and has a roll executed directly from it).
	 */
	prepareDerivedData() {
		const systemData = this.system;
		if (!systemData.traits) return;

		// Damage calculations.
		const monitor = [];
		for (let i = 0; i < 12; i++) {
			let modifier = (usr.damageModifier[i + 1] ?? -10).toString();
			if (modifier === "-10") {
				modifier = "X";
			}
			if (modifier === "0") {
				modifier = "";
			}
			monitor[i] = {
				value: "",
				modifier,
			};
		}
		let damage = 0;
		Object.keys(usr.wounds)
			.reverse()
			.forEach((type) => {
				const oldDamage = damage;
				let typeDamage = systemData.health[type] ?? 0;
				if (damage + typeDamage > 12) {
					typeDamage = 12 - damage;
				}
				damage += typeDamage;

				// Fill monitor.
				for (let i = oldDamage; i < damage; i++) {
					monitor[i].value = type;
				}
			});

		const modifier = usr.damageModifier[damage] ?? -10;
		let modifierText = modifier.toString();
		if (modifier < -9) {
			modifierText = "X";
		} else if (modifier > -1) {
			modifierText = "None";
		}

		const fortitudeTotal =
			systemData.traits.fortitude.value +
			(systemData.traits.fortitude.modifier ?? 0);
		const resistance = {
			x: Math.ceil(fortitudeTotal * 0.9),
			l: Math.ceil(fortitudeTotal * 0.8),
			m: Math.ceil(fortitudeTotal * 0.7),
			s: Math.ceil(fortitudeTotal * 0.6),
			d: Math.ceil(fortitudeTotal * 0.5),
		};

		systemData.damage = {
			damage,
			modifier,
			modifierText,
			resistance,
			monitor,
		};

		// Make separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.
		this._prepareCharacterData();
		this._prepareNpcData();
	}

	/**
	 * Prepare Character type specific data
	 */
	_prepareCharacterData() {
		if (this.type !== "character") return;

		// Make modifications to data here. For example:
		const systemData = this.system;
	}

	/**
	 * Prepare NPC type specific data.
	 */
	_prepareNpcData() {
		if (this.type !== "npc") return;

		// Make modifications to data here. For example:
		const systemData = this.system;
		//systemData.xp = (systemData.cr * systemData.cr) * 100;
	}

	/**
	 * Override getRollData() that's supplied to rolls.
	 */
	getRollData() {
		const data = super.getRollData();

		// Prepare character roll data.
		this._getCharacterRollData(data);
		this._getNpcRollData(data);

		return data;
	}

	/**
	 * Prepare character roll data.
	 */
	_getCharacterRollData(data) {
		if (this.type !== "character") return;

		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		if (data.abilities) {
			for (let [k, v] of Object.entries(data.abilities)) {
				data[k] = foundry.utils.deepClone(v);
			}
		}
	}

	/**
	 * Prepare NPC roll data.
	 */
	_getNpcRollData(data) {
		if (this.type !== "npc") return;

		// Process additional NPC data here.
	}
}
