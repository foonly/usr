/**
 * Extend the base Combat document to handle USR-specific phases.
 * @extends {Combat}
 */
export class usrCombat extends Combat {
	/** @inheritdoc */
	async _onCreate(data, options, userId) {
		await super._onCreate(data, options, userId);
		if (game.user.id === userId) {
			await this.update({
				"flags.usr.phase": 1,
				turn: null,
			});
		}
	}

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);

		// If the round is changing, reset combatant flags for the new round
		if ("round" in changed && changed.round > this.round) {
			const updates = this.combatants.map((c) => {
				return {
					_id: c.id,
					"flags.usr.action": {
						revealed: false,
						acted: false,
						status: null,
						stance: "",
						type: "melee",
						targetId: "",
						movement: "none",
						description: "",
					},
					initiative: null,
				};
			});
			await this.updateEmbeddedDocuments("Combatant", updates);

			// Reset phase to Phase 1: Define and reset turn to -1
			changed["flags.usr.phase"] = 1;
			changed["turn"] = null;
		}
	}

	/** @inheritdoc */
	async rollInitiative(ids, options = {}) {
		ids = typeof ids === "string" ? [ids] : ids;
		for (const id of ids) {
			const combatant = this.combatants.get(id);
			if (combatant) await combatant.rollInitiative(null, options);
		}
		return this;
	}

	/**
	 * Transition to the next phase of combat.
	 */
	async nextPhase() {
		let currentPhase = this.getFlag("usr", "phase");
		if (currentPhase === undefined) {
			await this.setFlag("usr", "phase", 1);
			currentPhase = 1;
		}
		let nextPhase = currentPhase + 1;

		if (nextPhase > 3) {
			return this.nextRound();
		}

		// If moving to Phase 2, reveal all actions and reset turn
		if (nextPhase === 2) {
			const updates = this.combatants.map((c) => ({
				_id: c.id,
				"flags.usr.action.revealed": true,
			}));
			await this.updateEmbeddedDocuments("Combatant", updates);
			return this.update({ "flags.usr.phase": nextPhase, turn: null });
		}

		return this.update({ "flags.usr.phase": nextPhase });
	}

	/**
	 * Reset to the previous phase.
	 */
	async previousPhase() {
		const currentPhase = this.getFlag("usr", "phase") ?? 1;
		let prevPhase = currentPhase - 1;
		if (prevPhase < 1) return;
		return this.update({ "flags.usr.phase": prevPhase });
	}
}
