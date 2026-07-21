import { usr } from "./config.mjs";
import { showRoll } from "./roll.mjs";

const { DialogV2 } = foundry.applications.api;

function getDialogValue(dialog, selector) {
	return dialog.element.querySelector(selector)?.value;
}

export function removeStun(actor) {
	const health = actor.system.health;
	if (health.x > 0) {
		health.x--;
		actor.update({ "system.health": health });
	}
}

export async function addHealingPoints(actor) {
	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/heal-dialog.hbs",
		{},
	);

	return new DialogV2({
		classes: ["usr", "dialog", "heal"],
		window: {
			title: "Add Healing Points",
		},
		content,
		buttons: [
			{
				action: "heal",
				icon: "fa-solid fa-mortar-pestle",
				label: "Heal",
				default: true,
				callback: (_event, _button, dialog) => {
					let total = 0;
					const health = actor.system.health;
					health.hp =
						(health.hp ?? 0) +
						Number.parseInt(getDialogValue(dialog, "#add-hp") ?? "0", 10);
					if (health.hp > 0) {
						Object.keys(usr.wounds).forEach((key) => {
							const wound = usr.wounds[key];
							if (wound.hp > 0) {
								let nr = health[key];
								if (nr > 0) {
									let healNr = Math.floor(health.hp / wound.hp);
									if (healNr > nr) healNr = nr;
									health[key] -= healNr;
									health.hp -= healNr * wound.hp;
								}
							} else {
								health[key] = 0;
							}
							total += health[key];
						});
					}
					if (total < 1) {
						health.hp = 0;
					}

					actor.update({ "system.health": health });
				},
			},
		],
	}).render({ force: true });
}

function getArgs(dialog) {
	const type = getDialogValue(dialog, "#wound") ?? "x";
	const location = getDialogValue(dialog, "#location") ?? "none";
	let amount = Number.parseInt(
		getDialogValue(dialog, "#add-damage") ?? "0",
		10,
	);
	const spendRed = dialog.element.querySelector("#spend-red")?.checked ?? false;
	return { type, location, amount, spendRed };
}

async function applyRedChipMitigation(actor, args) {
	if (args.spendRed) {
		const redChips = actor.system.chips?.red ?? 0;
		if (redChips > 0) {
			await actor.update({ "system.chips.red": redChips - 1 });
			args.amount = Math.floor(args.amount / 2);
			ChatMessage.create({
				speaker: ChatMessage.getSpeaker({ actor }),
				content: "Spent a Red Chip to negate half the damage.",
				flavor: "Fate Chip Mitigation",
			});
		}
	}
}

export async function addDamage(actor) {
	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/damage-dialog.hbs",
		{
			wounds: usr.wounds,
			redChips: actor.system.chips?.red ?? 0,
		},
	);

	return new DialogV2({
		classes: ["usr", "dialog", "damage"],
		window: {
			title: "Take Damage",
		},
		content,
		buttons: [
			{
				action: "damage",
				icon: "fa-solid fa-burst",
				label: "Damage",
				callback: async (_event, _button, dialog) => {
					const args = getArgs(dialog);
					await applyRedChipMitigation(actor, args);
					setDamage(args.amount, args.type, actor);
					if (["m", "s", "d"].includes(args.type) && args.amount > 0) {
						triggerTraumaCheck(actor, args.type, args.amount, args.location);
					}
				},
			},
			{
				action: "resist",
				icon: "fa-solid fa-person-burst",
				label: "Resist",
				default: true,
				callback: async (_event, _button, dialog) => {
					const args = getArgs(dialog);
					await applyRedChipMitigation(actor, args);
					resistDamage(args.amount, args.type, actor, args.location);
				},
			},
		],
	}).render({ force: true });
}

function resistDamage(amount, type, actor, location = "none") {
	const resist = actor.system.damage.resistance[type];
	const wound = usr.wounds[type];

	new Roll(`${amount}d10`).evaluate().then((roll) => {
		const result = {
			amount,
			type: "d10",
			resist,
			dice: [],
			successes: 0,
			critical: false,
			formula: `Rolling against ${resist} for ${wound.label}.`,
			total: "",
		};

		for (const die of roll.dice[0].results) {
			result.dice.push({
				value: die.result,
				success: die.result <= resist,
			});
			if (die.result <= resist) {
				result.successes++;
			}
		}
		let remaining = amount - result.successes;
		result.total = `${remaining} of ${amount} Remaining`;

		const speaker = ChatMessage.getSpeaker({ actor: actor });
		showRoll(
			roll,
			result,
			speaker,
			`Resisting ${amount} ${wound.label} damage.`,
		);

		if (remaining > 0) {
			setDamage(remaining, type, actor);

			if (["m", "s", "d"].includes(type)) {
				triggerTraumaCheck(actor, type, remaining, location);
			}
		}
	});
}

export async function triggerTraumaCheck(
	actor,
	type,
	netDamage,
	location = "none",
) {
	try {
		console.log(
			`USR | Triggering Trauma Check for ${actor.name} (Type: ${type}, Net Damage: ${netDamage}, Location: ${location})`,
		);

		// Check for Red Chips
		const redChips = actor.system.chips?.red ?? 0;
		if (redChips > 0) {
			const spend = await DialogV2.confirm({
				window: { title: "Negate Trauma Roll?" },
				content: `<p>You have ${redChips} Red Chips. Spend one to skip this Trauma Roll?</p>`,
				classes: ["usr", "dialog"],
			});

			if (spend) {
				await actor.update({ "system.chips.red": redChips - 1 });
				ChatMessage.create({
					speaker: ChatMessage.getSpeaker({ actor }),
					content: "Spent a Red Chip to negate the Trauma Roll.",
					flavor: "Fate Chip Mitigation",
				});
				return;
			}
		}

		let modifier = 0;
		if (type === "m") modifier = netDamage;
		else if (type === "s") modifier = netDamage * 2;
		else if (type === "d") modifier = netDamage * 3;

		const roll = await new Roll(`2d10 + ${modifier}`).evaluate();
		const total = roll.total;

		let result = usr.traumaTable[usr.traumaTable.length - 1];
		for (const entry of usr.traumaTable) {
			if (total <= entry.total) {
				result = entry;
				break;
			}
		}

		// Apply bleeding if worse than current
		const bleedingOrder = ["none", "low", "medium", "high"];
		const currentBleeding = actor.system.bleeding || "none";
		if (
			bleedingOrder.indexOf(result.bleeding) >
			bleedingOrder.indexOf(currentBleeding)
		) {
			await actor.update({ "system.bleeding": result.bleeding });
		}

		// Handle Death's Door (Lose 1D4 Blood Points)
		if (result.label === "USR.TraumaDeathsDoor") {
			const bloodRoll = await new Roll("1d4").evaluate();
			const currentBlood = actor.system.blood.value;
			await actor.update({
				"system.blood.value": Math.max(0, currentBlood - bloodRoll.total),
			});
			bloodRoll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor }),
				flavor: "Blood Loss from Death's Door",
			});
		}

		const speaker = ChatMessage.getSpeaker({ actor });
		const localizedLabel = game.i18n.localize(result.label);
		const title = localizedLabel.includes(":")
			? localizedLabel.split(":")[0]
			: "Trauma Check";

		// Sub-table mapping for locations
		const subTableKeyMap = {
			"USR.TraumaGrizzledScar": "scar",
			"USR.TraumaBoneFracture": "fracture",
			"USR.TraumaSevereNerveInjury": "nerve",
			"USR.TraumaCatastrophicMaiming": "maim",
		};

		let subTableText = "";
		if (location !== "none") {
			const subKey = subTableKeyMap[result.label];
			if (subKey) {
				const subTableStringKey = usr.traumaSubTable[location]?.[subKey];
				if (subTableStringKey) {
					subTableText = game.i18n.localize(subTableStringKey);
				}
			}
		}

		const content = `
			<div class="trauma-roll">
				<h3>Trauma Check: ${title}</h3>
				<p><strong>Roll:</strong> ${roll.formula} = ${total}</p>
				<p>${localizedLabel}</p>
				${location !== "none" ? `<p><strong>Hit Location:</strong> ${location.charAt(0).toUpperCase() + location.slice(1)}</p>` : ""}
				${subTableText ? `<div class="trauma-subeffect" style="margin-top: 0.5rem; padding: 0.4rem; background: rgba(0,0,0,0.15); border-left: 2px solid var(--usr-accent); border-radius: 2px;"><p><strong>Location Specific Injury:</strong> ${subTableText}</p></div>` : ""}
				<p><strong>Systemic Bleeding:</strong> ${game.i18n.localize(`USR.Bleeding${result.bleeding.charAt(0).toUpperCase() + result.bleeding.slice(1)}`)}</p>
			</div>
		`;

		await roll.toMessage(
			{
				speaker,
				flavor: "Trauma Check",
				content,
			},
			{
				rollMode: game.settings.get("core", "rollMode"),
			},
		);
		console.log(
			"USR | Trauma Check message created successfully via roll.toMessage.",
		);
	} catch (error) {
		console.error("USR | Error in triggerTraumaCheck:", error);
	}
}

function setDamage(amount, type, actor) {
	const health = actor.system.health;
	const wound = usr.wounds[type];
	health[type] += amount;

	actor.update({ "system.health": health });

	const speaker = ChatMessage.getSpeaker({ actor });
	const content = `${amount} boxes of ${wound.label} damage.`;
	const messageData = {
		user: game.user.id,
		content,
		speaker,
		flavor: "Received Damage",
	};

	const msg = new ChatMessage(messageData);
	ChatMessage.create(msg.toObject(), {
		rollMode: game.settings.get("core", "rollMode"),
	});
}
