import { usr } from "./config.mjs";

const { DialogV2 } = foundry.applications.api;

export async function usrRoll(data) {
	const coreTraits = data.actor?.system?.traits;
	const skillTraits = data.actor?.system?.skillTraits;
	if (!coreTraits) {
		console.error("USR | usrRoll: Actor has no traits:", data.actor);
		return { roll: null, result: null };
	}
	data.specialization = Number.isFinite(data.specialization)
		? data.specialization
		: 0;

	let roundsFired = 1;
	let fireMode = "single";

	// Ammunition check and consumption for ranged attacks
	if (data.item && data.item.type === "ranged" && data.skipDamage !== true) {
		const burstVal = data.item.system.burst ?? 0;
		fireMode = data.item.system.fireMode ?? "single";

		if (burstVal > 1) {
			if (fireMode === "burst") {
				const min = Math.round(burstVal * 0.5);
				const max = Math.round(burstVal * 1.5);
				roundsFired = Math.floor(Math.random() * (max - min + 1)) + min;
			} else if (fireMode === "auto") {
				const min = Math.round(burstVal * 2.0);
				const max = Math.round(burstVal * 3.0);
				roundsFired = Math.floor(Math.random() * (max - min + 1)) + min;
			}
		}

		const magazine = data.item.system.magazine ?? 0;
		if (magazine <= 0) {
			ui.notifications.error("Magazine is empty! Reload first.");
			// Play custom metallic click sound for empty chamber
			game.audio.play("systems/usr/assets/sounds/gun_click.wav", {
				volume: 0.8,
			});
			return { roll: null, result: null };
		}

		roundsFired = Math.min(roundsFired, magazine);

		if (typeof data.item.update === "function") {
			await data.item.update({ "system.magazine": magazine - roundsFired });
		}
	}

	// Get values for trait and specialization if given.
	let traitLabel = "";
	if (data.trait) {
		let trait = coreTraits[data.trait] || skillTraits?.[data.trait];
		if (!trait) {
			if (CONFIG.usr.traits.skills.includes(data.trait)) {
				trait = {
					label: `USR.Trait${data.trait.charAt(0).toUpperCase() + data.trait.slice(1)}`,
					value: 1,
					xp: 0,
					roll: 0,
					hasSpec: true,
					spec: [],
				};
			} else {
				console.error(
					`USR | usrRoll: Could not find trait "${data.trait}" for actor:`,
					data.actor,
				);
				ui.notifications.warn(
					`Could not find trait "${data.trait}" for this roll.`,
				);
				return { roll: null, result: null };
			}
		}
		traitLabel = game.i18n.localize(trait.label);
		const traitValue = Number.isFinite(trait.value) ? trait.value : 0;
		const traitModifier = Number.isFinite(trait.modifier) ? trait.modifier : 0;
		data.skill = traitValue + traitModifier;

		if (data.spec && Array.isArray(trait.spec)) {
			// Find specialization by slug first, then by title (legacy fallback)
			const specSlug = data.spec;
			const specConfig = usr.specializations[data.trait];
			const localizedLabel = specConfig?.[specSlug]
				? game.i18n.localize(specConfig[specSlug]).toLowerCase()
				: "";

			trait.spec.forEach((spec) => {
				const specTitle = spec.title.toLowerCase();
				if (
					specSlug === spec.title || // Match by slug
					(localizedLabel && localizedLabel === specTitle) // Legacy fallback
				) {
					const specValue = Number.isFinite(spec.value) ? spec.value : 0;
					const specModifier = Number.isFinite(spec.modifier)
						? spec.modifier
						: 0;
					data.specialization = specValue + specModifier;
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

	// Combine unified general modifier with mobility modifier if rolling mobility
	let totalPenalty = damageMod;
	if (data.actor?.system?.encumbrance && data.trait === "mobility") {
		totalPenalty += data.actor.system.encumbrance.mobility ?? 0;
	}

	// Apply combined penalty to difficulty (number of dice)
	const originalDifficulty = data.difficulty;
	if (totalPenalty < 0) {
		const diffSequence = [6, 5, 4, 3, 2, 1, -2, -3, -4, -5, -6, -7];
		let currentIndex = diffSequence.indexOf(originalDifficulty);
		if (currentIndex === -1) currentIndex = 2; // Default to Normal (Index 2)

		const penalty = Math.abs(totalPenalty);
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
		damageModifier: totalPenalty,
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

	// Determine if we should suppress the default roll message because a combat interaction will be created
	let willCreateInteraction = false;
	const isMelee =
		data.item?.type === "melee" ||
		(data.item &&
			!data.item.type &&
			data.flavor?.toLowerCase().includes("melee"));

	if (data.actor && data.item && data.skipDamage !== true) {
		const target = game.user.targets.first();
		if (isMelee && target) {
			willCreateInteraction = true;
		}
	}

	if (data.createMessage !== false && !willCreateInteraction) {
		if (data.spec) {
			const specConfig = usr.specializations[data.trait];
			const specLabelKey = specConfig?.[data.spec];
			const specLabel = specLabelKey
				? game.i18n.localize(specLabelKey)
				: data.spec;
			if (specLabel) {
				// If flavor already starts with weapon name, insert specialization
				if (flavor.includes("(") && flavor.includes(")")) {
					flavor = flavor.replace("(", `(${specLabel} - `);
				} else if (
					flavor === specLabel ||
					flavor.toLowerCase() === specLabel.toLowerCase()
				) {
					flavor = `${traitLabel} (${specLabel})`;
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

	// Handle combat interaction or damage roll
	if (data.item && data.skipDamage !== true) {
		let item = data.item;
		if (!item.system && data.actor) {
			item = data.actor.items.get(data.item._id || data.item.id);
		}

		if (item) {
			try {
				const target = game.user.targets.first();

				// Melee attack flow
				if (item.type === "melee") {
					if (target) {
						return await createCombatInteraction(
							data.actor,
							target.actor,
							item,
							result,
							flavor,
						);
					} else if (game.combat?.active) {
						ui.notifications.warn("Please select a target for melee attacks.");
						return { roll, result };
					}
				}

				// Ranged or out-of-combat untargeted: resolve immediately if hit
				if (roundsFired > 1) {
					// Burst or Auto fire mode
					const targetActor = game.user.targets.first()?.actor || null;
					const target = game.user.targets.first();
					const targetName = target
						? target.name
						: targetActor
							? targetActor.name
							: null;
					const fireModeLabel =
						fireMode === "burst" ? "Burst Fire" : "Auto Fire";

					if (result.successes === 0) {
						// Missed completely!
						const messageData = {
							item: item.toObject ? item.toObject(false) : item,
							fireModeLabel,
							roundsFired,
							hits: [],
							finalDamage: 0,
							finalLethality: "Stun",
							finalLethalityKey: "x",
							isMiss: true,
							targetName,
						};

						const content =
							await foundry.applications.handlebars.renderTemplate(
								"systems/usr/templates/helpers/burst-damage-roll.hbs",
								messageData,
							);

						await ChatMessage.create({
							content,
							speaker: ChatMessage.getSpeaker({ actor: data.actor }),
							flavor: `${item.name} — ${fireModeLabel} Missed`,
						});
					} else {
						// Hit! (successes >= 1)
						const numHits = Math.min(result.successes, roundsFired);
						const hits = [];

						for (let i = 0; i < numHits; i++) {
							// Each hit has 1 success for damage resolution (bonusDamage = 1)
							const hitResult = await rollDamage(
								data.actor,
								item,
								1,
								targetActor,
								true,
							);
							hits.push(hitResult);
						}

						// Resolve merging logic
						const nonDeflectedHits = hits.filter((h) => h.damage > 0);

						let finalDamage = 0;
						let finalLethality = "Stun";
						let finalLethalityKey = "x";

						if (nonDeflectedHits.length > 0) {
							const weightMap = { x: 1, l: 2, m: 3, s: 4, d: 5 };

							// Calculate values for each non-deflected hit
							nonDeflectedHits.forEach((h) => {
								const weight = weightMap[h.lethalityKey] || 1;
								h.calcValue = h.damage * weight;
							});

							// Find the base hit (highest calcValue, tie-breaker: highest weight)
							let baseHit = null;
							for (const hit of nonDeflectedHits) {
								if (!baseHit) {
									baseHit = hit;
									continue;
								}
								const hitWeight = weightMap[hit.lethalityKey] || 1;
								const baseWeight = weightMap[baseHit.lethalityKey] || 1;

								if (hit.calcValue > baseHit.calcValue) {
									baseHit = hit;
								} else if (hit.calcValue === baseHit.calcValue) {
									if (hitWeight > baseWeight) {
										baseHit = hit;
									}
								}
							}

							// Sum the others
							let otherSum = 0;
							nonDeflectedHits.forEach((hit) => {
								if (hit !== baseHit) {
									otherSum += hit.calcValue;
								}
							});

							const totalCalcValue = baseHit.calcValue + otherSum / 2;
							const baseWeight = weightMap[baseHit.lethalityKey] || 1;

							finalDamage = Math.ceil(totalCalcValue / baseWeight);
							finalLethality = baseHit.lethality;
							finalLethalityKey = baseHit.lethalityKey;
						}

						const messageData = {
							item: item.toObject ? item.toObject(false) : item,
							fireModeLabel,
							roundsFired,
							hits,
							finalDamage,
							finalLethality,
							finalLethalityKey,
							isMiss: false,
							targetName,
						};

						const content =
							await foundry.applications.handlebars.renderTemplate(
								"systems/usr/templates/helpers/burst-damage-roll.hbs",
								messageData,
							);

						await ChatMessage.create({
							content,
							speaker: ChatMessage.getSpeaker({ actor: data.actor }),
							flavor: `${item.name} — ${fireModeLabel} Damage`,
						});
					}
				} else {
					// Single shot / normal attack (roundsFired === 1)
					if (result.successes > 0) {
						const bonusDamage = result.successes;
						const targetActor = game.user.targets.first()?.actor || null;
						await rollDamage(data.actor, item, bonusDamage, targetActor);
					}
				}
			} catch (err) {
				console.error("USR | Damage roll failed:", err);
			}
		}
	}

	if (data.trait && data.actor) {
		const isCore = !!coreTraits[data.trait];
		const traits = isCore ? coreTraits : skillTraits;
		const updatedTraits = foundry.utils.deepClone(traits);
		let awarded = false;
		if (data.trait) {
			let trait = isCore
				? updatedTraits[data.trait]
				: updatedTraits[data.trait]; // Same access for skillTraits now it's an Object
			if (!trait && !isCore && CONFIG.usr.traits.skills.includes(data.trait)) {
				trait = {
					label: `USR.Trait${data.trait.charAt(0).toUpperCase() + data.trait.slice(1)}`,
					value: 1,
					xp: 0,
					roll: 0,
					hasSpec: true,
					spec: [],
				};
				updatedTraits[data.trait] = trait;
			}
			if (!trait) return { roll, result };
			if (data.spec && Array.isArray(trait.spec)) {
				trait.spec.forEach((spec) => {
					if (data.spec === spec.title) {
						const specValue = Number.isFinite(spec.value) ? spec.value : 0;
						const specRoll = Number.isFinite(spec.roll) ? spec.roll : 0;
						if (specValue < (CONFIG.usr.traitMax || 7)) {
							awarded = true;
							let increment = 1;
							if (data.difficulty === 4) increment = 2;
							else if (data.difficulty <= 3) increment = 3;
							spec.roll = specRoll + increment;
						}
					}
				});
			}
			if (!awarded) {
				const traitValue = Number.isFinite(trait.value) ? trait.value : 0;
				const traitRoll = Number.isFinite(trait.roll) ? trait.roll : 0;
				if (traitValue < (CONFIG.usr.traitMax || 7)) {
					let increment = 1;
					if (data.difficulty === 4) increment = 2;
					else if (data.difficulty <= 3) increment = 3;
					trait.roll = traitRoll + increment;
				}
			}
		}
		const updateKey = isCore ? "system.traits" : "system.skillTraits";
		await data.actor.update({ [updateKey]: updatedTraits });
	}

	return { roll, result };
}

export async function rollDamage(
	actor,
	item,
	bonusDamage = 0,
	targetActor = null,
	skipMessage = false,
) {
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

	let deflectResult = null;
	if (targetActor && item.type === "ranged" && location) {
		const locationLabel = location.label.toLowerCase();
		let coverageKey = null;
		if (locationLabel.includes("head")) coverageKey = "head";
		else if (locationLabel.includes("torso")) coverageKey = "torso";
		else if (locationLabel.includes("arms")) coverageKey = "arms";
		else if (locationLabel.includes("legs")) coverageKey = "legs";

		if (coverageKey) {
			const equippedArmors = targetActor.items.filter(
				(i) =>
					i.type === "armor" &&
					i.system.equipped &&
					i.system.locations?.[coverageKey],
			);

			if (equippedArmors.length > 0) {
				let maxDie = "none";
				let maxBonus = 0;

				const dieWeight = { none: 0, d4: 1, d6: 2, d8: 3 };

				equippedArmors.forEach((armor) => {
					const die = armor.system.deflectDie ?? "none";
					const bonus = armor.system.deflectBonus ?? 0;
					if (dieWeight[die] > dieWeight[maxDie]) {
						maxDie = die;
					}
					if (bonus > maxBonus) {
						maxBonus = bonus;
					}
				});

				let rollVal = 0;
				let rollFormula = "";
				if (maxDie !== "none") {
					const armorRoll = await new Roll(`2${maxDie}`).evaluate();
					rollVal = armorRoll.total;
					rollFormula = `2${maxDie} (${rollVal}) + ${maxBonus}`;
				} else if (maxBonus > 0) {
					rollFormula = `${maxBonus}`;
				}

				const totalDeflect = rollVal + maxBonus;
				const penetration = item.system.penetration ?? 0;
				const netDeflect = Math.max(0, totalDeflect - penetration);

				deflectResult = {
					hasArmor: true,
					coverageKey,
					maxDie,
					maxBonus,
					rollVal,
					rollFormula,
					totalDeflect,
					penetration,
					netDeflect,
				};
			}
		}
	}

	const totalDamage = item.system.damage + bonusDamage;
	let finalDamage = totalDamage;
	if (deflectResult) {
		finalDamage = Math.max(0, totalDamage - deflectResult.netDeflect);
	}

	const target = game.user.targets.first();
	const targetName = target
		? target.name
		: targetActor
			? targetActor.name
			: null;
	const armorVal = deflectResult ? deflectResult.totalDeflect : 0;
	const penetration = item.system?.penetration ?? 0;
	const formulaString = `${totalDamage} + ${penetration} - ${armorVal}`;

	const result = {
		item: item.toObject ? item.toObject(false) : item,
		location: location?.label ?? "Unknown",
		lethality: usr.wounds[lethalityKey]?.label ?? "Unknown",
		lethalityKey: lethalityKey,
		damage: finalDamage,
		baseDamage: item.system.damage,
		bonusDamage: bonusDamage,
		totalDamage: totalDamage,
		dice: roll.dice[0].results.map((r) => r.result),
		total: total,
		deflectResult,
		targetName,
		formulaString,
	};

	if (skipMessage) {
		return result;
	}

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
		netSuccesses: attackResult.successes,
		defenseWeapons,
		resolved: attackResult.successes === 0,
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
	if (data.actor) {
		data.traits = [];
		const processTrait = (key, trait) => {
			const traitLabel = game.i18n.localize(trait.label);
			data.traits.push({
				key,
				index: key,
				label: traitLabel,
				value: trait.value,
				active: traitLabel === data.label,
			});
			if (trait.hasSpec && trait.spec) {
				const specConfig = usr.specializations[key];
				trait.spec.forEach((spec) => {
					const specLabel = specConfig?.[spec.title]
						? game.i18n.localize(specConfig[spec.title])
						: spec.title;
					data.traits.push({
						key,
						index: `${key}/${spec.title}`,
						label: ` - ${specLabel}`,
						value: `${trait.value}/${spec.value}`,
						active: spec.title === data.label,
					});
				});
			}
		};

		if (data.actor.system.traits) {
			Object.entries(data.actor.system.traits).forEach(([key, trait]) =>
				processTrait(key, trait),
			);
		}
		if (data.actor.system.skillTraits) {
			Object.entries(data.actor.system.skillTraits).forEach(([key, trait]) =>
				processTrait(key, trait),
			);
		}
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
	const coreTraits = data.actor.system.traits;
	const skillTraits = data.actor.system.skillTraits;
	const isCore = !!coreTraits[data.trait];
	const traits = isCore ? coreTraits : skillTraits;
	const trait = isCore
		? coreTraits[data.trait]
		: skillTraits[data.trait] || {
				label: `USR.Trait${data.trait.charAt(0).toUpperCase() + data.trait.slice(1)}`,
				value: 1,
				xp: 0,
				roll: 0,
				hasSpec: true,
				spec: [],
			};

	if (data.spec) {
		trait.spec.forEach((spec) => {
			if (data.spec === spec.title) {
				// Roll on specialization.
				if (spec.value >= (CONFIG.usr.traitMax || 7)) {
					return false;
				}
				let paid = false;
				if (spec.roll > 0) {
					if (spec.roll >= 64) spec.roll = 8;
					else if (spec.roll >= 8) spec.roll = 1;
					else spec.roll = 0;
					paid = true;
				} else if (data.actor.system.xp > 0) {
					data.actor.update({ "system.xp": data.actor.system.xp - 1 });
					paid = true;
				}
				if (paid) {
					const originalValue = spec.value;
					const target = originalValue * 3 + 10;
					new Roll("2d10").evaluate().then((roll) => {
						const isSuccess = roll.total > target;
						if (isSuccess) {
							spec.xp++;
							if (spec.xp > 2) {
								spec.value++;
								spec.xp -= 3;
							}
						}
						const label = `Roll for XP on ${spec.title} (Level ${originalValue}). Needs > ${target}: <strong>${isSuccess ? "Success!" : "Failure"}</strong>`;
						roll.toMessage({
							speaker: ChatMessage.getSpeaker({ actor: data.actor }),
							flavor: label,
							rollMode: game.settings.get("core", "rollMode"),
						});
						if (isCore) {
							const updatedTraits = foundry.utils.deepClone(coreTraits);
							data.actor.update({ "system.traits": updatedTraits });
						} else {
							const updatedTraits = foundry.utils.deepClone(
								data.actor.system.toObject().skillTraits,
							);
							updatedTraits[data.trait] = trait;
							data.actor.update({ "system.skillTraits": updatedTraits });
						}
					});
				}
			}
		});
	} else {
		// Roll on trait.
		if (trait.value >= (CONFIG.usr.traitMax || 7)) {
			return false;
		}
		let paid = false;
		if (trait.roll > 0) {
			if (trait.roll >= 64) trait.roll = 8;
			else if (trait.roll >= 8) trait.roll = 1;
			else trait.roll = 0;
			paid = true;
		} else if (data.actor.system.xp > 0) {
			data.actor.update({ "system.xp": data.actor.system.xp - 1 });
			paid = true;
		}
		if (paid) {
			const originalValue = trait.value;
			const target = originalValue * 2 + 6;
			new Roll("2d10").evaluate().then((roll) => {
				const isSuccess = roll.total > target;
				if (isSuccess) {
					trait.xp++;
					if (trait.xp > 4) {
						trait.value++;
						trait.xp -= 5;
					}
				}
				const traitLabel = game.i18n.localize(trait.label);
				const label = `Roll for XP on ${traitLabel} (Level ${originalValue}). Needs > ${target}: <strong>${isSuccess ? "Success!" : "Failure"}</strong>`;
				roll.toMessage({
					speaker: ChatMessage.getSpeaker({ actor: data.actor }),
					flavor: label,
					rollMode: game.settings.get("core", "rollMode"),
				});
				if (isCore) {
					const updatedTraits = foundry.utils.deepClone(coreTraits);
					data.actor.update({ "system.traits": updatedTraits });
				} else {
					const updatedTraits = foundry.utils.deepClone(
						data.actor.system.toObject().skillTraits,
					);
					updatedTraits[data.trait] = trait;
					data.actor.update({ "system.skillTraits": updatedTraits });
				}
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
