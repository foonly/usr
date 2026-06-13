import { usrRoll } from "../helpers/roll.mjs";

/**
 * Extend the base Combatant document to handle USR-specific initiative.
 * @extends {Combatant}
 */
export class usrCombatant extends Combatant {
	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		this.updateSource({ "flags.usr.position": 4 });
	}

	/** @inheritdoc */
	async rollInitiative(
		formula,
		{ updateTurn = true, messageMode, messageOptions = {} } = {},
	) {
		const action = this.getFlag("usr", "action") || {};
		const stance = action.stance || "defensive";
		let position = this.getFlag("usr", "position") ?? 4;

		const difficulty =
			stance === "aggressive" ? 6 : stance === "defensive" ? 2 : 4;
		const actor = this.actor;

		if (!actor) {
			ui.notifications.warn(
				`Combatant ${this.name} has no actor associated with it.`,
			);
			return this;
		}

		let diceBonus = 0;
		if (action.boostType === "initiative" && action.boostAmount > 0) {
			const amount = Math.min(action.boostAmount, position);
			diceBonus = amount;
			position -= amount;
			await this.setFlag("usr", "position", position);
		}

		// Use the core usrRoll function directly
		const rollResult = await usrRoll({
			actor: this.actor,
			trait: "initiative",
			difficulty: difficulty,
			diceBonus: diceBonus,
			flavor: `Initiative (${stance} stance)${diceBonus ? ` + ${diceBonus} Boost` : ""}`,
			createMessage: true,
		});

		if (!rollResult || !rollResult.result) {
			return this;
		}

		let successes = rollResult.result.successes;

		// Handle Position Boost
		if (action.boostType === "position" && successes > 0) {
			successes -= 1;
			position = Math.min(position + 1, 5);
			await this.setFlag("usr", "position", position);

			// If reduced to 0, it counts as failed initiative
			if (successes === 0) {
				// We can add a message or just let it be 0
			}
		}

		// Update initiative in the combatant document
		await this.update({ initiative: successes });

		return this;
	}
}
