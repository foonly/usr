import { usr } from "./config.mjs";

const { DialogV2 } = foundry.applications.api;

export async function usrRoll(data) {
	const traits = data.actor?.system?.traits;
	if (!traits) {
		console.error("USR | usrRoll: Actor has no traits:", data.actor);
		return { roll: null, result: null };
	}
	data.specialization = Number.isFinite(data.specialization)
		? data.specialization
		: 0;

	// Get values for trait and specialization if given.
	if (data.trait) {
		const trait = traits[data.trait];
		if (!trait) {
			console.error(
				`USR | usrRoll: Could not find trait "${data.trait}" for actor:`,
				data.actor,
			);
			ui.notifications.warn(
				`Could not find trait "${data.trait}" for this roll.`,
			);
			return { roll: null, result: null };
		}
		data.skill = Number.isFinite(trait.value) ? trait.value : 0;
		if (data.spec && Array.isArray(trait.spec)) {
			// Find specialization by title (case insensitive) or by translating the internal key
			const targetTitle = data.spec.toLowerCase();
			const translatedTitle =
				usr.meleeSpecializations[data.spec] ||
				usr.rangedSpecializations[data.spec]
					? game.i18n
							.localize(
								usr.meleeSpecializations[data.spec] ||
									usr.rangedSpecializations[data.spec],
							)
							.toLowerCase()
					: "";

			trait.spec.forEach((spec) => {
				const specTitle = spec.title.toLowerCase();
				if (
					targetTitle === specTitle ||
					(translatedTitle && translatedTitle === specTitle)
				) {
					data.specialization = Number.isFinite(spec.value) ? spec.value : 0;
				}
			});
		}
	}

	data.skill = Number.isFinite(data.skill) ? data.skill : 0;
	if (data.skill <= data.specialization) {
		data.specialization = data.skill - 1;
	}
	// Since difficulty goes from down from 1 to -2, a difficulty of 0 or -1 should be converted to -2.
	if (data.difficulty < 1 && data.difficulty > -2) {
		data.difficulty = -2;
	}
	const nr = Math.abs(data.difficulty);

	const roll = await new Roll(`${nr}d10`).evaluate();
	const result = {
		difficulty: data.difficulty,
		skill: data.skill,
		specialization: data.specialization,
		type: "d10",
		dice: [],
		successes: 0,
		critical: false,
		formula: "",
		total: "",
	};

	/* Start tens and ones at -1, because we start counting from the second one. */
	let ones = -1;
	let tens = -1;
	let failed = false;

	for (const die of roll.dice[0].results) {
		result.dice.push({
			value: die.result,
			success: die.result <= result.skill,
		});
		if (result.difficulty < 0) {
			if (die.result > result.skill) {
				failed = true;
			}
		} else {
			if (die.result <= result.skill) {
				result.successes++;
			}
		}
		if (die.result <= result.specialization) {
			result.successes++;
		}
		if (die.result === 1) {
			ones++;
		}
		if (die.result === 10) {
			tens++;
		}
	}

	if (ones > 0) {
		result.successes += ones;
		result.critical = true;
	}

	if (tens > 0) {
		result.successes -= tens;
		if (result.successes < 0) {
			result.successes = 0;
			result.critical = true;
		}
	}

	if (result.difficulty < 0) {
		if (failed) {
			result.successes = 0;
		} else {
			result.successes++;
		}
	}

	result.formula = `Difficulty: ${result.difficulty} / Skill: ${result.skill}`;
	if (result.specialization > 0) {
		result.formula += ` (${result.specialization})`;
	}
	result.total =
		(result.critical ? "Critical " : "") +
		(result.successes ? result.successes + " Successes" : "Fail");

	const speaker = ChatMessage.getSpeaker({ actor: data.actor });

	if (data.createMessage !== false) {
		showRoll(roll, result, speaker, data.flavor);
	}

	// Handle damage roll if it's a weapon and has successes
	if (
		data.item &&
		(data.item.type === "melee" || data.item.type === "ranged")
	) {
		const item = data.item.toObject
			? data.item
			: data.actor.items.get(data.item._id || data.item.id);
		if (item) {
			await rollDamage(data.actor, item);
		}
	}

	if (!result.critical && data.trait && data.actor) {
		const updatedTraits = foundry.utils.deepClone(traits);
		let awarded = false;
		if (data.trait) {
			const trait = updatedTraits[data.trait];
			if (!trait) return { roll, result };
			if (data.spec && Array.isArray(trait.spec)) {
				trait.spec.forEach((spec) => {
					if (data.spec === spec.title) {
						const specValue = Number.isFinite(spec.value) ? spec.value : 0;
						const specRoll = Number.isFinite(spec.roll) ? spec.roll : 0;
						if (
							specValue < 3 &&
							(specRoll < 1 || (specRoll < 2 && data.difficulty < 4))
						) {
							awarded = true;
							spec.roll = specRoll + 1;
						}
					}
				});
			}
			if (!awarded) {
				const traitValue = Number.isFinite(trait.value) ? trait.value : 0;
				const traitRoll = Number.isFinite(trait.roll) ? trait.roll : 0;
				if (
					traitValue < 7 &&
					(traitRoll < 1 || (traitRoll < 2 && data.difficulty < 4))
				) {
					trait.roll = traitRoll + 1;
				}
			}
		}
		await data.actor.update({ "system.traits": updatedTraits });
	}

	return { roll, result };
}

export async function rollDamage(actor, item) {
	const roll = await new Roll("2d10").evaluate();
	const total = roll.total;
	let location = null;
	let lethalityKey = "l";

	if (item.type === "melee") {
		location = usr.hitLocationMelee.find((l) => l.roll.includes(total));
		const baseLethality = item.system.lethality; // stun, light, moderate, serious, deadly
		const lethalityMap = {
			stun: 0,
			light: 1,
			moderate: 2,
			serious: 3,
			deadly: 4,
		};
		const lethalityReverse = ["x", "l", "m", "s", "d"]; // wounds keys

		let lethIndex = lethalityMap[baseLethality] ?? 1;
		if (location) lethIndex += location.lethality;
		lethIndex = Math.clamp(lethIndex, 0, 4);
		lethalityKey = lethalityReverse[lethIndex];
	} else {
		location = usr.hitLocationRanged.find((l) => l.roll.includes(total));
		const mod = item.system.lethalityModifier ?? 0;
		const lethalityMap = { x: 0, l: 1, m: 2, s: 3, d: 4 };
		const lethalityReverse = ["x", "l", "m", "s", "d"];

		let lethIndex = lethalityMap[location?.lethality ?? "l"];
		lethIndex += mod;
		lethIndex = Math.clamp(lethIndex, 0, 4);
		lethalityKey = lethalityReverse[lethIndex];
	}

	const result = {
		item: item.toObject ? item.toObject(false) : item,
		location: location?.label ?? "Unknown",
		lethality: usr.wounds[lethalityKey]?.label ?? "Unknown",
		lethalityKey: lethalityKey,
		damage: item.system.damage,
		dice: roll.dice[0].results.map((r) => r.result),
		total: total,
	};

	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/damage-roll.hbs",
		result,
	);

	const messageData = {
		content,
		speaker: ChatMessage.getSpeaker({ actor }),
		flavor: `${item.name} - Damage & Location`,
	};

	return ChatMessage.create(messageData);
}

export function showRoll(roll, result, speaker, flavor = "") {
	foundry.applications.handlebars
		.renderTemplate("systems/usr/templates/helpers/roll.hbs", result)
		.then((content) => {
			// Prepare chat data
			const messageData = {
				content,
				speaker,
				rollMode: game.settings.get("core", "rollMode"),
				flavor,
			};

			roll.toMessage(messageData);
		});
}

export async function makeRoll(data = {}) {
	if (data.actor && data.actor.system.traits) {
		data.traits = [];
		Object.keys(data.actor.system.traits).forEach((key) => {
			const trait = data.actor.system.traits[key];
			data.traits.push({
				key,
				index: key,
				label: trait.label,
				value: trait.value,
				active: trait.label === data.label,
			});
			if (trait.hasSpec && trait.spec) {
				trait.spec.forEach((spec) => {
					data.traits.push({
						key,
						index: `${key}/${spec.title}`,
						label: ` - ${spec.title}`,
						value: `${trait.value}/${spec.value}`,
						active: spec.title === data.label,
					});
				});
			}
		});
	}

	data.difficulty = usr.difficulty;
	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/roll-dialog.hbs",
		data,
	);

	return new DialogV2({
		classes: ["usr", "dialog", "roll"],
		window: {
			title: "Custom Roll",
		},
		content,
		buttons: [
			{
				action: "roll",
				icon: "fa-solid fa-dice-d10",
				label: "Roll",
				default: true,
				callback: (_event, _button, dialog) => {
					const labelElement = dialog.element.querySelector("#label");
					const flavor = labelElement?.innerHTML ?? "Custom";
					const difficulty = Number.parseInt(
						dialog.element.querySelector("#difficulty")?.value ?? "1",
						10,
					);
					const parts = (
						dialog.element.querySelector("#trait")?.value ?? "1"
					).split("/");
					const trait = parts[0];
					const spec = parts[1] ?? "";

					const actor = data.actor ?? game.user.character;
					if (!actor) {
						ui.notifications.warn("No actor available for this roll.");
						return;
					}

					usrRoll({
						flavor,
						difficulty,
						trait,
						spec,
						actor,
					});
				},
			},
		],
	}).render({ force: true });
}

export function rollXp(data) {
	const traits = data.actor.system.traits;
	const trait = traits[data.trait];
	if (data.spec) {
		trait.spec.forEach((spec) => {
			if (data.spec === spec.title) {
				// Roll on specialization.
				if (spec.value > 2) {
					return false;
				}
				let paid = false;
				if (spec.roll > 0) {
					spec.roll--;
					paid = true;
				} else if (data.actor.system.xp > 0) {
					data.actor.update({ "system.xp": data.actor.system.xp - 1 });
					paid = true;
				}
				if (paid) {
					const target = spec.value * 3 + 10;
					new Roll("2d10").evaluate().then((roll) => {
						if (roll.total > target) {
							spec.xp++;
							if (spec.xp > 2) {
								spec.value++;
								spec.xp -= 3;
							}
						}
						const label = `Roll for XP on ${spec.title} with value of ${spec.value}. Needs a result over ${target}.`;
						roll.toMessage({
							speaker: ChatMessage.getSpeaker({ actor: data.actor }),
							flavor: label,
							rollMode: game.settings.get("core", "rollMode"),
						});
						const updatedTraits = foundry.utils.deepClone(traits);
						data.actor.update({ "system.traits": updatedTraits });
					});
				}
			}
		});
	} else {
		// Roll on trait.
		if (trait.value > 6) {
			return false;
		}
		let paid = false;
		if (trait.roll > 0) {
			trait.roll--;
			paid = true;
		} else if (data.actor.system.xp > 0) {
			data.actor.update({ "system.xp": data.actor.system.xp - 1 });
			paid = true;
		}
		if (paid) {
			const target = trait.value * 2 + 6;
			new Roll("2d10").evaluate().then((roll) => {
				if (roll.total > target) {
					trait.xp++;
					if (trait.xp > 4) {
						trait.value++;
						trait.xp -= 5;
					}
				}
				const label = `Roll for XP on ${trait.label} with value of ${trait.value}. Needs a result over ${target}.`;
				roll.toMessage({
					speaker: ChatMessage.getSpeaker({ actor: data.actor }),
					flavor: label,
					rollMode: game.settings.get("core", "rollMode"),
				});
				const updatedTraits = foundry.utils.deepClone(traits);
				data.actor.update({ "system.traits": updatedTraits });
			});
		}
	}
}

export function rollChip(actor, dice = 1) {
	const chips = actor.system.chips;
	const total =
		chips.white + chips.green + chips.blue + chips.red + chips.black;
	new Roll(`${dice}d6cs>${total}`).evaluate().then((roll) => {
		const result = {
			type: "d6",
			dice: [],
			successes: roll.total,
			formula: `${dice}D6 against ${total} chips.`,
			total: "No Chip",
		};
		for (const die of roll.dice[0].results) {
			result.dice.push({ value: die.result, success: die.result > total });
		}
		const speaker = ChatMessage.getSpeaker({ actor });
		if (roll.total > 0) {
			const newChips = {
				white: chips.white,
				green: chips.green,
				blue: chips.blue,
				red: chips.red,
				black: chips.black,
			};
			new Roll("1d5").evaluate().then((chip) => {
				switch (chip.total) {
					case 1:
						newChips.white++;
						result.total = "White Chip";
						break;
					case 2:
						newChips.green++;
						result.total = "Green Chip";
						break;
					case 3:
						newChips.blue++;
						result.total = "Blue Chip";
						break;
					case 4:
						newChips.red++;
						result.total = "Red Chip";
						break;
					case 5:
						newChips.black++;
						result.total = "Black Chip";
						break;
				}
				actor.update({ "system.chips": newChips });
				showRoll(roll, result, speaker, "Fate Chip");
			});
		} else {
			showRoll(roll, result, speaker, "Fate Chip");
		}
	});
}
