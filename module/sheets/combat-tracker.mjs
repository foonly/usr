/**
 * Extend the base CombatTracker to provide USR-specific functionality.
 * @extends {foundry.applications.sidebar.tabs.CombatTracker}
 */
export class usrCombatTracker
	extends foundry.applications.sidebar.tabs.CombatTracker
{
	/** @inheritdoc */
	static get DEFAULT_OPTIONS() {
		return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
			actions: {
				selectAction: usrCombatTracker.#onSelectAction,
				toggleActed: usrCombatTracker.#onToggleActed,
				nextPhase: usrCombatTracker.#onNextPhase,
				previousPhase: usrCombatTracker.#onPreviousPhase,
			},
		});
	}

	/** @inheritdoc */
	static PARTS = {
		header: {
			template: "systems/usr/templates/combat/header.hbs",
		},
		tracker: {
			template: "systems/usr/templates/combat/tracker.hbs",
			scrollable: [".plain"],
		},
		footer: {
			template: "systems/usr/templates/combat/footer.hbs",
		},
	};

	/** @inheritdoc */
	async _preparePartContext(partId, context, options) {
		await super._preparePartContext(partId, context, options);
		const combat = this.viewed;
		if (!combat) return context;

		context.phase = combat.getFlag("usr", "phase") || 1;
		const phaseNames = {
			1: "Define Actions",
			2: "Resolve Initiative",
			3: "Resolve Combat",
		};
		context.phaseName = phaseNames[context.phase];

		if (partId === "tracker") {
			for (const t of context.turns || []) {
				const combatant = combat.combatants.get(t.id);
				if (!combatant) continue;

				const action = combatant.getFlag("usr", "action") || {};
				let targetName = "";
				if (action.targetId) {
					if (action.targetId.startsWith("custom:")) {
						targetName = action.targetId.replace("custom:", "");
					} else {
						const target = combat.combatants.get(action.targetId);
						targetName = target?.name || "Unknown Target";
					}
				}

				t.usrAction = action;
				t.usrTargetName = targetName;
				t.hasUsrAction = !!action.stance;
			}
		}

		return context;
	}

	/** @inheritdoc */
	async _onRender(context, options) {
		await super._onRender(context, options);
		this.element.querySelectorAll(".combatant").forEach((li) => {
			const combatantId = li.dataset.combatantId;
			const combatant = this.viewed.combatants.get(combatantId);
			if (!combatant) return;
			const action = combatant.getFlag("usr", "action");
			if (action?.stance) {
				li.classList.add("ready");
			}
		});
	}

	/**
	 * Handle selecting an action for a combatant.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	static async #onSelectAction(event, target) {
		const combatantId = target.closest(".combatant").dataset.combatantId;
		const combatant = this.viewed.combatants.get(combatantId);
		if (!combatant) return;

		// Create a dialog for action selection
		const action = combatant.getFlag("usr", "action") || {
			stance: "neutral",
			type: "melee",
			targetId: "",
			movement: "none",
			description: "",
		};

		// Prepare target options (all other combatants)
		const targets = this.viewed.combatants
			.filter((c) => c.id !== combatantId)
			.map((c) => ({ id: c.id, name: c.name }));

		const content = await foundry.applications.handlebars.renderTemplate(
			"systems/usr/templates/combat/action-selection.hbs",
			{
				action,
				targets,
				isCustomTarget: action.targetId?.startsWith("custom:"),
				stances: {
					aggressive: "Aggressive",
					neutral: "Neutral",
					defensive: "Defensive",
				},
				types: {
					melee: "Melee",
					ranged: "Ranged",
				},
				movements: {
					none: "None",
					slow: "Slow",
					fast: "Fast",
				},
			},
		);

		const { DialogV2 } = foundry.applications.api;
		const dialog = new DialogV2({
			window: { title: `Select Action for ${combatant.name}` },
			content,
			buttons: [
				{
					action: "save",
					label: "Save Action",
					default: true,
					callback: async (event, button, dialog) => {
						const formData = new foundry.applications.ux.FormDataExtended(
							dialog.element.querySelector("form"),
						).object;

						if (!formData.stance) {
							ui.notifications.warn("You must select a stance.");
							return;
						}

						if (formData.targetType === "custom") {
							formData.targetId = `custom:${formData.customTarget}`;
						}
						delete formData.targetType;
						delete formData.customTarget;

						// Stance-based validation
						if (formData.stance === "defensive") {
							formData.targetId = "";
						}
						if (formData.stance === "neutral" && formData.movement === "fast") {
							formData.movement = "slow";
						}

						await combatant.setFlag("usr", "action", {
							...formData,
							revealed: false,
							acted: false,
							status: null,
						});
						ui.combat.render();
					},
				},
			],
		});

		dialog.render(true).then(() => {
			const html = dialog.element;
			const stanceSelector = html.querySelector(".stance-selector");
			const movementSelector = html.querySelector('select[name="movement"]');
			const targetGroup = html.querySelector(".target-group");
			const fastOption = movementSelector.querySelector('option[value="fast"]');

			const updateForm = () => {
				const stance = stanceSelector.value;

				// Handle Target Visibility
				if (stance === "defensive") {
					targetGroup.style.display = "none";
				} else {
					targetGroup.style.display = "flex";
				}

				// Handle Fast Movement Availability
				if (stance === "neutral") {
					if (movementSelector.value === "fast") {
						movementSelector.value = "slow";
					}
					fastOption.disabled = true;
				} else {
					fastOption.disabled = false;
				}
			};

			stanceSelector.addEventListener("change", updateForm);
			updateForm(); // Initial call
		});
	}

	/**
	 * Handle toggling the acted status for a combatant.
	 */
	static async #onToggleActed(event, target) {
		const combatantId = target.closest(".combatant").dataset.combatantId;
		const combatant = this.viewed.combatants.get(combatantId);
		if (!combatant) return;
		const current = combatant.getFlag("usr", "action.acted") || false;
		await combatant.setFlag("usr", "action.acted", !current);
	}

	/**
	 * Handle moving to the next phase.
	 */
	static async #onNextPhase(event, target) {
		const combat = this.viewed;
		if (!combat) return;

		let currentPhase = combat.getFlag("usr", "phase");
		if (currentPhase === undefined) currentPhase = 1;

		// If transitioning from Phase 2 to Phase 3, we should ensure all comparisons are done
		if (currentPhase === 2) {
			await usrCombatTracker.#resolveAllInitiatives(combat);
		}

		await combat.nextPhase();
	}

	/**
	 * Handle moving to the previous phase.
	 */
	static async #onPreviousPhase(event, target) {
		if (this.viewed) await this.viewed.previousPhase();
	}

	/**
	 * Resolve all initiatives and compare against targets.
	 * @param {Combat} combat
	 */
	static async #resolveAllInitiatives(combat) {
		const updates = [];
		for (const combatant of combat.combatants) {
			const action = combatant.getFlag("usr", "action");
			if (!action || action.stance === "defensive") {
				updates.push({
					_id: combatant.id,
					"flags.usr.action.status": "defensive",
				});
				continue;
			}

			if (action.targetId && !action.targetId.startsWith("custom:")) {
				const target = combat.combatants.get(action.targetId);
				if (target) {
					const attackerSuccesses = combatant.initiative || 0;
					const targetSuccesses = target.initiative || 0;

					let status = "failed";
					if (attackerSuccesses === 0) status = "failed";
					else if (attackerSuccesses > targetSuccesses) status = "win";
					else if (attackerSuccesses === targetSuccesses) status = "tie";
					else status = "loss";

					updates.push({
						_id: combatant.id,
						"flags.usr.action.status": status,
					});
				}
			}
			// Custom targets or no targets are handled manually by the GM or remain null
		}

		if (updates.length) {
			await combat.updateEmbeddedDocuments("Combatant", updates);
		}
	}
}
