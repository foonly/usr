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
	const damageMod = data.actor.system.damage?.modifier ?? 0;
	if (damageMod < -9) {
		const speaker = ChatMessage.getSpeaker({ actor: data.actor });
		const result = {
			formula: `Difficulty: ${data.difficulty} (Incapacitated)`,
			total: "Automatic Fail (Incapacitated)",
			dice: [],
			successes: 0,
			damageModifier: damageMod,
		};
		if (data.createMessage !== false) {
			showRoll(null, result, speaker, data.flavor);
		}
		return { roll: null, result };
	}

	// Apply damage penalty to difficulty (number of dice)
	const originalDifficulty = data.difficulty;
	if (damageMod < 0) {
		const diffSequence = [6, 5, 4, 3, 2, 1, -2, -3, -4, -5, -6, -7];
		let currentIndex = diffSequence.indexOf(originalDifficulty);
		if (currentIndex === -1) currentIndex = 2; // Default to Normal (Index 2)

		const penalty = Math.abs(damageMod);
		const newIndex = Math.min(diffSequence.length - 1, currentIndex + penalty);
		data.difficulty = diffSequence[newIndex];
	}

	const nr = Math.abs(data.difficulty) + (data.diceBonus || 0);
	const roll = await new Roll(`${nr}d10`).evaluate();
	const result = {
		difficulty: data.difficulty,
		originalDifficulty: originalDifficulty,
		skill: data.skill,
		specialization: data.specialization,
		type: "d10",
		dice: [],
		successes: 0,
		critical: false,
		formula: "",
		total: "",
		damageModifier: damageMod,
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

	if (result.damageModifier < 0) {
		result.formula = `Difficulty: ${result.difficulty} (${result.originalDifficulty}${result.damageModifier}) / Skill: ${result.skill}`;
	} else {
		result.formula = `Difficulty: ${result.difficulty} / Skill: ${result.skill}`;
	}

	if (result.specialization > 0) {
		result.formula += ` (${result.specialization})`;
	}

	result.total =
		(result.critical ? "Critical " : "") +
		(result.successes ? result.successes + " Successes" : "Fail");

	const speaker = ChatMessage.getSpeaker({ actor: data.actor });
	let flavor = data.flavor || "";

	if (data.createMessage !== false) {
		if (data.spec) {
			const specLabelKey =
				usr.meleeSpecializations[data.spec] ||
				usr.rangedSpecializations[data.spec];
			if (specLabelKey) {
				const specLabel = game.i18n.localize(specLabelKey);
				// If flavor already starts with weapon name, insert specialization
				if (flavor.includes("(") && flavor.includes(")")) {
					flavor = flavor.replace("(", `(${specLabel} - `);
				} else {
					flavor = `${flavor} (${specLabel})`;
				}
			}
		}
		if (result.damageModifier < 0 && result.damageModifier >= -9) {
			flavor += ` (${result.damageModifier} Damage Penalty)`;
		}
		showRoll(roll, result, speaker, flavor);
	}

	// Handle damage roll if it's a weapon and has successes
	if (
		result.successes > 0 &&
		data.item &&
		data.skipDamage !== true &&
		(data.item.type === "melee" || data.item.type === "ranged")
	) {
		let item = data.item;
		if (!item.system && data.actor) {
			item = data.actor.items.get(data.item._id || data.item.id);
		}

		if (item) {
			try {
				const isMelee = item.type === "melee";
				const target = game.user.targets.first();

				// Melee attack flow
				if (isMelee) {
					if (target) {
						return await createCombatInteraction(
							data.actor,
							target.actor,
							item,
							result,
							flavor,
						);
					} else if (game.combat?.active) {
						// If in combat but no target, warn
						ui.notifications.warn("Please select a target for melee attacks.");
						return { roll, result };
					}
				}

				// Ranged, untargeted melee, or out-of-combat untargeted: resolve immediately
				// Add successes to damage
				const bonusDamage = result.successes;
				await rollDamage(data.actor, item, bonusDamage);
			} catch (err) {
				console.error("USR | Damage roll failed:", err);
			}
		} else {
			console.warn(
				"USR | Item was provided but no item was found on the actor.",
			);
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

export async function rollDamage(actor, item, bonusDamage = 0) {
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

	const finalDamage = item.system.damage + bonusDamage;

	const result = {
		item: item.toObject ? item.toObject(false) : item,
		location: location?.label ?? "Unknown",
		lethality: usr.wounds[lethalityKey]?.label ?? "Unknown",
		lethalityKey: lethalityKey,
		damage: finalDamage,
		baseDamage: item.system.damage,
		bonusDamage: bonusDamage,
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

export async function createCombatInteraction(
	attacker,
	target,
	item,
	attackResult,
	flavor,
) {
	const defenseWeapons = target.items
		.filter((i) => i.type === "melee" && i.system.equipped)
		.map((i) => ({
			id: i.id,
			name: i.name,
			img: i.img,
			defenseBonus: i.system.defenseBonus,
		}));

	// Add Unarmed to defense options
	defenseWeapons.push({
		id: "unarmed",
		name: game.i18n.localize("USR.Unarmed"),
		img: "icons/skills/melee/unarmed-punch-fist.webp",
		defenseBonus: -1,
	});

	const combatant = game.combat?.combatants.find(
		(c) => c.actorId === target.id,
	);
	const inCombat = !!game.combat?.active && !!combatant;

	const data = {
		attacker: {
			id: attacker.id,
			uuid: attacker.uuid,
			name: attacker.name,
			img: attacker.img,
		},
		target: {
			id: target.id,
			uuid: target.uuid,
			name: target.name,
			img: target.img,
			inCombat,
			position: combatant?.getFlag("usr", "position") ?? 4,
			acted: combatant?.getFlag("usr", "action.acted") ?? false,
			stance: combatant?.getFlag("usr", "action.stance") ?? "neutral",
		},
		item: {
			id: item.id || item._id,
			name: item.name,
			img: item.img,
			type: item.type,
			system: item.system.toObject ? item.system.toObject() : item.system,
		},
		attackSuccesses: attackResult.successes,
		defenseSuccesses: 0,
		defenseWeapons,
		resolved: false,
		roll: attackResult, // Include full roll result for dice display
	};

	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/chat/combat-interaction.hbs",
		data,
	);

	const messageData = {
		content,
		speaker: ChatMessage.getSpeaker({ actor: attacker }),
		flavor: flavor || "Melee Attack - Waiting for Defense",
		flags: {
			usr: {
				attackData: data,
			},
		},
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
