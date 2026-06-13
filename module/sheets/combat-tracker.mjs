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
				startTurn: usrCombatTracker.#onStartTurn,
				increasePosition: usrCombatTracker.#onIncreasePosition,
				decreasePosition: usrCombatTracker.#onDecreasePosition,
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

		const phase = combat.getFlag("usr", "phase") || 1;
		context.phase = phase;
		const phaseNames = {
			1: "Define Actions",
			2: "Resolve Initiative",
			3: "Resolve Combat",
		};
		context.phaseName = phaseNames[phase];

		// Hide active turn indicator if not in Phase 3
		if (phase !== 3) {
			for (const turn of context.turns || []) {
				turn.active = false;
			}
		}

		if (partId === "tracker") {
			for (const t of context.turns || []) {
				const combatant = combat.combatants.get(t.id);
				if (!combatant) continue;

				const action = combatant.getFlag("usr", "action") || {};
				const position = combatant.getFlag("usr", "position") ?? 4;
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
				t.usrPosition = position;
				t.usrPositionDots = Array.from({ length: 5 }, (_, i) => i < position);
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

		const isCustomTarget = action.targetId?.startsWith("custom:");
		if (isCustomTarget) {
			action.customTargetName = action.targetId.replace("custom:", "");
		}

		const currentPosition = combatant.getFlag("usr", "position") ?? 4;

		const content = await foundry.applications.handlebars.renderTemplate(
			"systems/usr/templates/combat/action-selection.hbs",
			{
				action,
				targets,
				isCustomTarget,
				currentPosition,
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
			window: {
				title: `Select Action for ${combatant.name}`,
			},
			position: {
				width: 450,
			},
			classes: ["usr", "usr-action-selection-dialog"],
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

						if (formData.boostType === "initiative") {
							formData.boostAmount = Number.parseInt(formData.boostAmount) || 0;
						} else {
							delete formData.boostAmount;
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
			const stanceRadios = html.querySelectorAll('input[name="stance"]');
			const movementRadios = html.querySelectorAll('input[name="movement"]');
			const typeSelector = html.querySelector('select[name="targetType"]');
			const targetGroup = html.querySelector(".target-group");
			const combatantSelector = html.querySelector(".target-id-selector");
			const customInput = html.querySelector(".custom-target-input");
			const fastRadio = html.querySelector(
				'input[name="movement"][value="fast"]',
			);
			const boostRadios = html.querySelectorAll('input[name="boostType"]');
			const boostAmountContainer = html.querySelector(
				".boost-amount-container",
			);
			const posBoostOption = html.querySelector(".position-boost-option");
			const initBoostOption = html.querySelector(".initiative-boost-option");

			const updateForm = () => {
				const stance = html.querySelector(
					'input[name="stance"]:checked',
				)?.value;
				const targetType = typeSelector.value;
				const boostType = html.querySelector(
					'input[name="boostType"]:checked',
				)?.value;

				// Handle Target Visibility
				if (stance === "defensive") {
					targetGroup.style.display = "none";
				} else {
					targetGroup.style.display = "flex";
				}

				// Handle Boost Amount Visibility
				if (boostType === "initiative") {
					boostAmountContainer.style.display = "block";
				} else {
					boostAmountContainer.style.display = "none";
				}

				// Handle Target Type Toggling
				if (targetType === "custom") {
					combatantSelector.style.display = "none";
					customInput.style.display = "block";
				} else {
					combatantSelector.style.display = "block";
					customInput.style.display = "none";
				}

				// Handle Fast Movement Availability
				if (stance === "neutral") {
					if (fastRadio.checked) {
						html.querySelector('input[name="movement"][value="slow"]').checked =
							true;
					}
					fastRadio.disabled = true;
					fastRadio.closest(".radio-label").classList.add("disabled");
				} else {
					fastRadio.disabled = false;
					fastRadio.closest(".radio-label").classList.remove("disabled");
				}
			};

			stanceRadios.forEach((r) => r.addEventListener("change", updateForm));
			movementRadios.forEach((r) => r.addEventListener("change", updateForm));
			boostRadios.forEach((r) => r.addEventListener("change", updateForm));
			typeSelector.addEventListener("change", updateForm);
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
	 * Handle starting the turn for a combatant.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	static async #onStartTurn(event, target) {
		const combatantId = target.closest(".combatant").dataset.combatantId;
		const combat = this.viewed;
		if (!combat) return;

		// If there was a previous active combatant, mark them as acted
		if (combat.turn !== null) {
			const previousCombatant = combat.turns[combat.turn];
			if (previousCombatant && previousCombatant.id !== combatantId) {
				await previousCombatant.setFlag("usr", "action.acted", true);
			}
		}

		const turnIndex = combat.turns.findIndex((t) => t.id === combatantId);
		if (turnIndex === -1) return;

		await combat.update({ turn: turnIndex });

		const combatant = combat.turns[turnIndex];
		const action = combatant.getFlag("usr", "action");

		const token = combatant.token?.object;

		// Select the token
		if (token && token.isVisible && token.control) {
			token.control({ releaseOthers: true });
			if (canvas.ready) {
				canvas.animatePan({
					x: token.center.x,
					y: token.center.y,
					duration: 250,
				});
			}
		}

		// Handle targeting
		if (action?.targetId && !action.targetId.startsWith("custom:")) {
			const targetCombatant = combat.combatants.get(action.targetId);
			const targetToken = targetCombatant?.token?.object;
			if (targetToken && targetToken.isVisible) {
				targetToken.setTarget(true, { releaseOthers: true });
			} else {
				game.user.updateTokenTargets([]);
			}
		} else {
			game.user.updateTokenTargets([]);
		}
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
	 * Handle increasing position for a combatant.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	static async #onIncreasePosition(event, target) {
		const combatantId = target.closest(".combatant").dataset.combatantId;
		const combatant = this.viewed.combatants.get(combatantId);
		if (!combatant) return;
		const current = combatant.getFlag("usr", "position") ?? 4;
		if (current < 5) {
			await combatant.setFlag("usr", "position", current + 1);
		}
	}

	/**
	 * Handle decreasing position for a combatant.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	static async #onDecreasePosition(event, target) {
		const combatantId = target.closest(".combatant").dataset.combatantId;
		const combatant = this.viewed.combatants.get(combatantId);
		if (!combatant) return;
		const current = combatant.getFlag("usr", "position") ?? 4;
		if (current > 0) {
			await combatant.setFlag("usr", "position", current - 1);
		}
	}

	/**
	 * Resolve all initiatives and compare against targets.
	 * @param {Combat} combat
	 */
	static async #resolveAllInitiatives(combat) {
		const updates = [];
		for (const combatant of combat.combatants) {
			const action = combatant.getFlag("usr", "action");
			if (!action) continue;

			let status = null;
			if (action.targetId && !action.targetId.startsWith("custom:")) {
				const target = combat.combatants.get(action.targetId);
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
			// Custom targets or no targets are handled manually by the GM or remain null
		}

		if (updates.length) {
			await combat.updateEmbeddedDocuments("Combatant", updates);
		}
	}
}
