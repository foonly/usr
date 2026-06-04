import { usrRoll } from "../helpers/roll.mjs";

/**
 * Extend the base Combatant document to handle USR-specific initiative.
 * @extends {Combatant}
 */
export class usrCombatant extends Combatant {
	/** @inheritdoc */
	async rollInitiative(
		formula,
		{ updateTurn = true, messageMode, messageOptions = {} } = {},
	) {
		const action = this.getFlag("usr", "action") || {};
		const stance = action.stance || "defensive";

		if (stance === "defensive") {
			return this.update({ initiative: 0 });
		}

		const difficulty = stance === "aggressive" ? 6 : 3;
		const actor = this.actor;

		if (!actor) {
			ui.notifications.warn(
				`Combatant ${this.name} has no actor associated with it.`,
			);
			return this;
		}

		// Use the core usrRoll function directly
		const rollResult = await usrRoll({
			actor: this.actor,
			trait: "initiative",
			difficulty: difficulty,
			flavor: `Initiative (${stance} stance)`,
			createMessage: true,
		});

		if (!rollResult || !rollResult.result) {
			return this;
		}

		// Update initiative in the combatant document
		await this.update({ initiative: rollResult.result.successes });

		return this;
	}
}
