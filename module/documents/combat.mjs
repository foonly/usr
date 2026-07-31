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
				const currentAction = c.getFlag("usr", "action") || {};
				return {
					_id: c.id,
					"flags.usr.action": {
						revealed: false,
						acted: false,
						status: null,
						stance: "",
						type: "melee",
						targetId: currentAction.targetId || "",
						movement: "none",
						description: "",
						boostType: "none",
						boostAmount: 0,
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

		// If moving to Phase 2, reveal all actions, apply defensive position bonus, and reset turn
		if (nextPhase === 2) {
			const updates = this.combatants.map((c) => {
				const action = c.getFlag("usr", "action") || {};
				const update = {
					_id: c.id,
					"flags.usr.action.revealed": true,
				};
				if (action.stance === "defensive") {
					const currentPos = c.getFlag("usr", "position") ?? 4;
					update["flags.usr.position"] = Math.min(currentPos + 2, 5);
				}
				return update;
			});
			await this.updateEmbeddedDocuments("Combatant", updates);
			return this.update({ "flags.usr.phase": nextPhase, turn: null });
		}

		// If moving to Phase 3, resolve all initiatives and compare against targets
		if (nextPhase === 3) {
			const updates = [];
			for (const combatant of this.combatants) {
				const action = combatant.getFlag("usr", "action");
				if (!action) continue;

				let status = null;
				if (action.targetId && !action.targetId.startsWith("custom:")) {
					const target = this.combatants.get(action.targetId);
					if (target) {
						const attackerSuccesses = combatant.initiative || 0;
						const targetSuccesses = target.initiative || 0;

						status = "failed";
						if (attackerSuccesses === 0) status = "failed";
						else if (attackerSuccesses > targetSuccesses) status = "win";
						else if (attackerSuccesses === targetSuccesses) status = "tie";
						else status = "loss";
					}
				} else if (action.stance === "defensive") {
					status = "defensive";
				}

				if (status) {
					updates.push({
						_id: combatant.id,
						"flags.usr.action.status": status,
					});
				}
			}

			if (updates.length) {
				await this.updateEmbeddedDocuments("Combatant", updates);
			}
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
