import { usr } from "./config.mjs";
import { showRoll } from "./roll.mjs";

export function removeStun(actor) {
	const health = actor.system.health;
	if (health.x > 0) {
		health.x--;
		actor.update({ "system.health": health });
	}
}

export function addHealingPoints(actor) {
	const data = {};
	foundry.applications.handlebars
		.renderTemplate("systems/usr/templates/helpers/heal-dialog.hbs", data)
		.then((content) => {
			let d = new Dialog({
				title: "Add Healing Points",
				content,
				buttons: {
					heal: {
						icon: '<i class="fas fa-mortar-pestle"></i>',
						label: "Heal",
						callback: (html) => {
							let total = 0;
							const health = actor.system.health;
							health.hp =
								(health.hp ?? 0) +
								parseInt(html.find("#add-hp")[0].value ?? "0");
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
								// Zero HP if no more damage.
								health.hp = 0;
							}

							actor.update({ "system.health": health });
						},
					},
				},
				default: "heal",
			});
			d.options.classes = ["usr", "dialog", "heal"];
			d.render(true);
		});
}

export function addDamage(actor) {
	const data = {
		wounds: usr.wounds,
	};
	foundry.applications.handlebars
		.renderTemplate("systems/usr/templates/helpers/damage-dialog.hbs", data)
		.then((content) => {
			let d = new Dialog({
				classes: ["usr", "dialog", "damage"],
				title: "Take Damage",
				content,
				buttons: {
					damage: {
						icon: '<i class="fas fa-burst"></i>',
						label: "Damage",
						callback: (html) => {
							const args = getArgs(html);
							setDamage(args.amount, args.type, actor);
						},
					},
					resist: {
						icon: '<i class="fas fa-person-burst"></i>',
						label: "Resist",
						callback: (html) => {
							const args = getArgs(html);
							resistDamage(args.amount, args.type, actor);
						},
					},
				},
				default: "resist",
			});
			d.options.classes = ["usr", "dialog", "damage"];
			d.render(true);
		});
}

function getArgs(html) {
	const type = html.find("#wound")[0].value ?? "x";
	const amount = parseInt(html.find("#add-damage")[0].value ?? "0");

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

	// Prepare chat data
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
