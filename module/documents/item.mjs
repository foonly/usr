// Import helper/utility classes and constants.
import { usrRoll } from "../helpers/roll.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class usrItem extends Item {
	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	getRollData() {
		// If present, return the actor's roll data.
		if (!this.actor) return null;
		const rollData = this.actor.getRollData();
		// Grab the item's system data as well.
		rollData.item = foundry.utils.deepClone(this.system);

		return rollData;
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll() {
		const item = this;
		const actor = this.actor;
		if (!actor) return;

		// Handle weapons
		if (item.type === "melee" || item.type === "ranged") {
			const trait = item.type === "melee" ? "melee" : "ranged";
			const spec = item.system.specialization || "";
			let label = `${item.name} (${item.type === "melee" ? "Melee" : "Ranged"} Attack)`;

			let diceBonus = 0;
			if (game.combat) {
				const combatant = game.combat.combatants.find(
					(c) => c.actorId === actor.id,
				);
				const stance = combatant?.getFlag("usr", "action.stance");
				if (stance === "defensive") {
					diceBonus = -1;
					label += " [Defensive Stance]";
				}
			}

			return usrRoll({
				actor,
				item,
				trait,
				spec,
				flavor: label,
				difficulty: 4, // Default to Normal
				diceBonus,
			});
		}

		// Initialize chat data.
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get("core", "rollMode");
		const label = `[${item.type}] ${item.name}`;

		// If there's no roll data, send a chat message.
		if (!this.system.formula) {
			ChatMessage.create({
				speaker: speaker,
				rollMode: rollMode,
				flavor: label,
				content: item.system.description ?? "",
			});
		}
		// Otherwise, create a roll and send a chat message from it.
		else {
			// Retrieve roll data.
			const rollData = this.getRollData();

			// Invoke the roll and submit it to chat.
			const roll = new Roll(rollData.item.formula, rollData);
			// If you need to store the value first, uncomment the next line.
			// let result = await roll.roll({async: true});
			roll.toMessage({
				speaker: speaker,
				rollMode: rollMode,
				flavor: label,
			});
			return roll;
		}
	}
}
