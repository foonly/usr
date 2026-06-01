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

export async function addDamage(actor) {
	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/damage-dialog.hbs",
		{ wounds: usr.wounds },
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
				callback: (_event, _button, dialog) => {
					const args = getArgs(dialog);
					setDamage(args.amount, args.type, actor);
				},
			},
			{
				action: "resist",
				icon: "fa-solid fa-person-burst",
				label: "Resist",
				default: true,
				callback: (_event, _button, dialog) => {
					const args = getArgs(dialog);
					resistDamage(args.amount, args.type, actor);
				},
			},
		],
	}).render({ force: true });
}

function getArgs(dialog) {
	const type = getDialogValue(dialog, "#wound") ?? "x";
	const amount = Number.parseInt(
		getDialogValue(dialog, "#add-damage") ?? "0",
		10,
	);
	return { type, amount };
}

function resistDamage(amount, type, actor) {
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
		}
	});
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
