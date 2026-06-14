// Import data models.
import * as models from "./data/_module.mjs";
// Import document classes.
import { usrActor } from "./documents/actor.mjs";
import { usrItem } from "./documents/item.mjs";
import { usrCombat } from "./documents/combat.mjs";
import { usrCombatant } from "./documents/combatant.mjs";
// Import sheet classes.
import { usrActorSheet } from "./sheets/actor-sheet.mjs";
import { usrItemSheet } from "./sheets/item-sheet.mjs";
import { usrCombatTracker } from "./sheets/combat-tracker.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { usr } from "./helpers/config.mjs";
import { usrRoll, rollDamage } from "./helpers/roll.mjs";
import { migrateWorld } from "./helpers/migration.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {
	// Add utility classes to the global game object so that they're more easily
	// accessible in global contexts.
	game.usr = {
		usrActor,
		usrItem,
		rollItemMacro,
		usrRoll,
		rollDamage,
		migrate: migrateWorld,
	};

	// Add custom constants for configuration.
	CONFIG.usr = usr;

	// Register data models
	CONFIG.Actor.dataModels = {
		character: models.CharacterData,
		npc: models.NpcData,
	};
	CONFIG.Item.dataModels = {
		item: models.ItemData,
		melee: models.MeleeData,
		ranged: models.RangedData,
		armor: models.ArmorData,
	};

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
		formula: "0",
		decimals: 0,
	};
	CONFIG.Combat.initiativeIcon = {
		icon: "/icons/svg/dice-target.svg",
		hover: "/icons/svg/dice-target.svg",
	};

	// Define custom Document classes
	CONFIG.Actor.documentClass = usrActor;
	CONFIG.Item.documentClass = usrItem;
	CONFIG.Combat.documentClass = usrCombat;
	CONFIG.Combatant.documentClass = usrCombatant;

	// Register sheet application classes
	CONFIG.ui.combat = usrCombatTracker;
	foundry.documents.collections.Actors.unregisterSheet(
		"core",
		foundry.applications.sheets.ActorSheet,
	);
	foundry.documents.collections.Actors.registerSheet("usr", usrActorSheet, {
		makeDefault: true,
	});
	foundry.documents.collections.Items.unregisterSheet(
		"core",
		foundry.applications.sheets.ItemSheet,
	);
	foundry.documents.collections.Items.registerSheet("usr", usrItemSheet, {
		makeDefault: true,
	});

	// Register world settings
	game.settings.register("usr", "systemVersion", {
		name: "System Version",
		scope: "world",
		config: false,
		type: String,
		default: "0.0.0",
	});

	game.settings.register("usr", "worldKnowledge", {
		name: "World Knowledge Skills",
		hint: "Additional knowledge skills available in this world (comma separated).",
		scope: "world",
		config: true,
		type: String,
		default: "",
	});

	// Preload Handlebars templates.
	return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
	// Only run migration for the GM
	if (!game.user.isGM) return;

	// Check if migration is needed
	const currentVersion = game.system.version;
	const lastVersion = game.settings.get("usr", "systemVersion");

	if (foundry.utils.isNewerVersion(currentVersion, lastVersion)) {
		await migrateWorld();
		await game.settings.set("usr", "systemVersion", currentVersion);
	}
});

/* -------------------------------------------- */
/*  Chat Hooks                                  */
/* -------------------------------------------- */

Hooks.on("renderChatMessageHTML", (message, html, data) => {
	const interaction = html.querySelector(".combat-interaction");
	if (!interaction) return;

	const attackData =
		message.getFlag("usr", "attackData") ||
		message.getFlag("usr", "defenseData");
	if (!attackData || attackData.resolved) return;

	const attacker = fromUuidSync(attackData.attacker.uuid);
	const target = fromUuidSync(attackData.target.uuid);

	// Defend Button (Opens Dialog)
	const defendButton = html.querySelector(".open-defense-dialog");
	if (defendButton) {
		// Only show to target or GM
		if (!target.isOwner && !game.user.isGM) {
			defendButton.style.display = "none";
		}

		defendButton.addEventListener("click", async (event) => {
			event.preventDefault();

			const defenseWeapons = target.items
				.filter((i) => i.type === "melee" && i.system.equipped)
				.map((i) => ({
					id: i.id,
					name: i.name,
					img: i.img,
					defenseBonus: i.system.defenseBonus,
				}));

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

			const templateData = {
				...attackData,
				target: {
					...attackData.target,
					inCombat,
					position: combatant?.getFlag("usr", "position") ?? 4,
					acted: combatant?.getFlag("usr", "action.acted") ?? false,
					stance: combatant?.getFlag("usr", "action.stance") ?? "neutral",
				},
				defenseWeapons,
			};

			const { DialogV2 } = foundry.applications.api;
			const content = await foundry.applications.handlebars.renderTemplate(
				"systems/usr/templates/dialog/defense-setup.hbs",
				templateData,
			);

			const dialog = new DialogV2({
				window: { title: `Select Defense for ${target.name}` },
				content,
				classes: ["usr", "defense-dialog"],
				buttons: [
					{
						action: "defend",
						label: "Perform Defense",
						class: "defend",
						default: true,
						callback: async (event, button, dialog) => {
							const formData = new foundry.applications.ux.FormDataExtended(
								dialog.element.querySelector("form"),
							).object;
							const itemId = formData.defenseItem;
							const diceBonus = parseInt(formData.boostDice || "0", 10);
							const actionType = formData.actionType || "main";

							let positionCost = diceBonus;
							if (
								actionType === "extra" &&
								templateData.target.stance !== "defensive"
							) {
								positionCost += 1;
							}

							if (inCombat && positionCost > templateData.target.position) {
								ui.notifications.warn("Not enough position!");
								return;
							}

							// Execute Roll
							let rollResult;

							if (itemId === "unarmed") {
								let difficulty = 3;
								if (inCombat) {
									const stance = templateData.target.stance;
									if (stance === "aggressive") difficulty = 2;
									else if (stance === "neutral") difficulty = 3;
									else if (stance === "defensive") difficulty = 4;
								}

								rollResult = await game.usr.usrRoll({
									actor: target,
									trait: "melee",
									difficulty: difficulty - 1,
									diceBonus: diceBonus,
									flavor: "Defense (Unarmed)",
									skipDamage: true,
									createMessage: false,
								});
							} else {
								const item = target.items.get(itemId);
								if (item) {
									rollResult = await item.rollDefend({
										diceBonus,
										createMessage: false,
									});
								}
							}

							// Handle Combatant updates
							if (inCombat && combatant) {
								const updates = {
									"flags.usr.position":
										templateData.target.position - positionCost,
								};
								if (actionType !== "extra")
									updates["flags.usr.action.acted"] = true;
								await combatant.update(updates);
							}

							// Create Defense Message and Resolve
							await resolveInteraction(
								message,
								attackData,
								rollResult?.result,
								target,
								attacker,
							);
							dialog.close();
						},
					},
					{
						action: "skip",
						label: "Skip Defense",
						class: "skip",
						callback: async (event, button, dialog) => {
							await resolveInteraction(
								message,
								attackData,
								null,
								target,
								attacker,
							);
							dialog.close();
						},
					},
				],
			});

			await dialog.render({ force: true });

			// Add interactivity after render
			const html = dialog.element;
			const slider = html.querySelector(".boost-dice-slider");
			const valueDisplay = html.querySelector(".boost-value");
			const actionRadios = html.querySelectorAll('input[name="actionType"]');
			const maxPosition = templateData.target.position;
			const stance = templateData.target.stance;

			const updateSlider = () => {
				const actionType =
					html.querySelector('input[name="actionType"]:checked')?.value ||
					"main";
				let currentMax = maxPosition;

				// Extra action cost (1 Position) unless in defensive stance
				if (actionType === "extra" && stance !== "defensive") {
					currentMax = Math.max(0, maxPosition - 1);
				}

				if (slider) {
					slider.max = currentMax;
					if (parseInt(slider.value, 10) > currentMax) {
						slider.value = currentMax;
					}
					if (valueDisplay) valueDisplay.textContent = slider.value;
				}

				// Update max label if it exists
				const maxLabel = html.querySelector(".slider-labels span:last-child");
				if (maxLabel) maxLabel.textContent = `Max (${currentMax})`;
			};

			if (slider) {
				slider.addEventListener("input", (e) => {
					if (valueDisplay) valueDisplay.textContent = e.target.value;
				});
			}

			actionRadios.forEach((radio) => {
				radio.addEventListener("change", updateSlider);
			});

			// Initial run
			updateSlider();
		});
	}
});

async function resolveInteraction(
	attackMsg,
	attackData,
	defenseRoll,
	target,
	attacker,
) {
	console.log("USR | Resolving Combat Interaction", {
		attackData,
		defenseRoll,
	});

	const defenseSuccesses = defenseRoll?.successes ?? 0;
	const netSuccesses = attackData.attackSuccesses - defenseSuccesses;

	// Prepare updated data for the summary message
	const summaryData = foundry.utils.deepClone(attackData);
	summaryData.resolved = true;
	summaryData.defenseSuccesses = defenseSuccesses;
	summaryData.netSuccesses = netSuccesses;
	summaryData.roll = defenseRoll; // Show defense roll at the top

	const updatedContent = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/chat/combat-interaction.hbs",
		summaryData,
	);

	// 1. Create a NEW summary message sent by the DEFENDER
	const summaryMessageData = {
		content: updatedContent,
		speaker: ChatMessage.getSpeaker({ actor: target }),
		flavor: "Combat Result",
		flags: {
			usr: {
				attackData: summaryData,
			},
		},
	};
	await ChatMessage.create(summaryMessageData);

	// 2. We can still TRY to update the original message to hide the button if we are the owner
	// but we don't rely on it for the result.
	if (attackMsg.isOwner || game.user.isGM) {
		await attackMsg.update({
			"flags.usr.attackData.resolved": true,
			content: `<div class="usr resolved-placeholder">Combat Resolved. See result above/below.</div>`,
		});
	}

	// Auto-roll damage in a SEPARATE message only if hit
	if (netSuccesses > 0) {
		const weapon = attacker.items.get(attackData.item.id) || attackData.item;
		await game.usr.rollDamage(attacker, weapon, netSuccesses);
	}
}

/* -------------------------------------------- */
/*  Combat & Token Hooks                        */
/* -------------------------------------------- */

/**
 * Sync active combatant's target flag when manually targeting on canvas.
 * Enforce single targeting by releasing other targets.
 */
Hooks.on("targetToken", (user, token, targeted) => {
	if (user.id !== game.user.id) return;
	if (!targeted) return;

	// Enforce single target
	for (let t of user.targets) {
		if (t !== token) t.setTarget(false, { releaseOthers: false, group: true });
	}

	if (!game.combat?.active || game.combat.getFlag("usr", "phase") !== 3) return;

	const activeCombatant = game.combat.turns[game.combat.turn];
	if (!activeCombatant || (!activeCombatant.isOwner && !game.user.isGM)) return;

	const targetedCombatant = game.combat.combatants.find(
		(c) => c.tokenId === token.document.id,
	);
	if (targetedCombatant && targetedCombatant.id !== activeCombatant.id) {
		activeCombatant.setFlag("usr", "action.targetId", targetedCombatant.id);
	}
});

/**
 * Draw the position tracker on tokens when in combat.
 */
Hooks.on("refreshToken", (token) => {
	const combatant = token.combatant;

	if (!combatant || !game.combat?.active) {
		if (token.usrPosition) token.usrPosition.visible = false;
		return;
	}

	if (!token.usrPosition) {
		token.usrPosition = token.addChild(new PIXI.Container());
	}
	token.usrPosition.visible = true;
	token.usrPosition.removeChildren().forEach((c) => c.destroy());

	const position = combatant.getFlag("usr", "position") ?? 4;
	const w = 8;
	const h = 8;
	const g = 2;
	const totalW = 5 * w + 4 * g;

	const graphics = new PIXI.Graphics();
	for (let i = 0; i < 5; i++) {
		const isFilled = i < position;
		graphics.beginFill(isFilled ? 0xffffff : 0x333333, 0.9);
		graphics.lineStyle(1, 0x000000, 1);
		graphics.drawRect(i * (w + g), 0, w, h);
		graphics.endFill();
	}
	token.usrPosition.addChild(graphics);

	// Position at the bottom center of the token
	token.usrPosition.x = (token.w - totalW) / 2;
	token.usrPosition.y = token.h - h - 5;
});

/**
 * Refresh token when combatant position changes.
 */
Hooks.on("updateCombatant", (combatant, changed, options, userId) => {
	if (foundry.utils.hasProperty(changed, "flags.usr.position")) {
		const token = combatant.token?.object;
		if (token) token.renderFlags.set({ refreshState: true });
	}
});

/* -------------------------------------------- */
/*  Token HUD                                   */
/* -------------------------------------------- */

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper("concat", function () {
	var outStr = "";
	for (var arg in arguments) {
		if (typeof arguments[arg] != "object") {
			outStr += arguments[arg];
		}
	}
	return outStr;
});

Handlebars.registerHelper("toLowerCase", function (str) {
	return str.toLowerCase();
});

Handlebars.registerHelper("capitalize", function (str) {
	if (typeof str !== "string") return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper("eq", function (a, b) {
	return a === b;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
	console.log("USR | Ready hook fired");

	// Register socket listener for message updates (required for non-owners to update attack messages)
	game.socket.on("system.usr", async (request) => {
		if (request.type === "updateChatMessage") {
			const message = game.messages.get(request.messageId);
			if (!message) return;

			// Handle update if we are the owner or an active GM
			const isOwner = game.user.id === message.author.id;
			const activeGM = game.users.activeGM;
			const isActiveGM = game.user.isGM && game.user.id === activeGM?.id;

			if (isOwner || isActiveGM) {
				await message.update(request.updateData);
			}
		}
	});

	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
	// First, determine if this is a valid owned item.
	if (data.type !== "Item") return;
	if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
		return ui.notifications.warn(
			"You can only create macro buttons for owned Items",
		);
	}
	// If it is, retrieve it based on the uuid.
	const item = await Item.fromDropData(data);

	// Create the macro command using the uuid.
	const command = `game.usr.rollItemMacro("${data.uuid}");`;
	let macro = game.macros.find(
		(m) => m.name === item.name && m.command === command,
	);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: "script",
			img: item.img,
			command: command,
			flags: { "usr.itemMacro": true },
		});
	}
	game.user.assignHotbarMacro(macro, slot);
	return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
	// Reconstruct the drop data so that we can load the item.
	const dropData = {
		type: "Item",
		uuid: itemUuid,
	};
	// Load the item from the uuid.
	Item.fromDropData(dropData).then((item) => {
		// Determine if the item loaded and if it's an owned item.
		if (!item || !item.parent) {
			const itemName = item?.name ?? itemUuid;
			return ui.notifications.warn(
				`Could not find item ${itemName}. You may need to delete and recreate this macro.`,
			);
		}

		// Trigger the item roll
		item.roll();
	});
}
