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

	// Preload Handlebars templates.
	return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Combat & Token Hooks                        */
/* -------------------------------------------- */

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

Hooks.on("renderTokenHUD", (app, html, data) => {
	// Hide the target button since USR uses a different targeting workflow
	const target =
		html[0]?.querySelector('[data-action="target"]') ||
		html.querySelector?.('[data-action="target"]');
	if (target) target.remove();
});

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

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
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
