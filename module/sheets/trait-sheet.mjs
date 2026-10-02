const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Edit a single trait on an actor using the Application V2 framework.
 */
export class TraitSheet extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(trait, key, actor, options = {}) {
		const label =
			trait?.label || `USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`;
		super(
			foundry.utils.mergeObject(
				{
					id: `trait-${actor.uuid.replaceAll(".", "-")}-${key}-edit-sheet`,
					window: {
						title: `Edit ${game.i18n.localize(label)}`,
					},
				},
				options,
			),
		);

		this.key = key;
		this.actor = actor;
		this.label = label;
	}

	/**
	 * Roll counters cleared in this editor but not yet saved.
	 * Holds "trait" for the trait itself and spec titles for specializations.
	 * @type {Set<string>}
	 */
	#clearedRolls = new Set();

	/**
	 * Whether the edited trait is a core trait (as opposed to a skill trait).
	 * @type {boolean}
	 */
	get isCore() {
		return !!this.actor.system.traits[this.key];
	}

	/**
	 * Read the trait's current stored data from the actor, filling in defaults.
	 * Always read fresh so rolls made while the editor is open are not overwritten.
	 * @returns {object}
	 */
	getStoredTrait() {
		const source = this.isCore
			? this.actor.system.traits[this.key]
			: this.actor.system.toObject().skillTraits?.[this.key];
		const trait = foundry.utils.deepClone(source || {});
		trait.label ||= this.label;
		trait.value ??= 1;
		trait.xp ??= 0;
		trait.roll ??= 0;
		trait.modifier ??= 0;
		if (!Array.isArray(trait.spec)) trait.spec = [];
		trait.hasSpec ??= this.isCore
			? ["mobility", "melee", "ranged"].includes(this.key)
			: true;
		return trait;
	}

	static DEFAULT_OPTIONS = {
		classes: ["usr", "sheet", "trait"],
		tag: "form",
		position: {
			width: 640,
			height: 640,
		},
		window: {
			contentClasses: ["standard-form"],
			resizable: true,
			title: "Edit Trait",
		},
		form: {
			handler: this.prototype._onSubmitForm,
			submitOnChange: false,
			closeOnSubmit: false,
		},
		actions: {
			saveAndClose: this.prototype._onSaveAndClose,
			clearRoll: this.prototype._onClearRoll,
			clearSpecRoll: this.prototype._onClearSpecRoll,
		},
	};

	/**
	 * Clear the main trait's roll counter. Applied when the form is saved.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	_onClearRoll(event, target) {
		this.#clearedRolls.add("trait");
		this.#showRollCleared(target);
	}

	/**
	 * Clear a specific specialization's roll counter. Applied when the form is saved.
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	_onClearSpecRoll(event, target) {
		this.#clearedRolls.add(target.dataset.slug);
		this.#showRollCleared(target);
	}

	/**
	 * Update the displayed roll counter without re-rendering, so unsaved edits are kept.
	 * @param {HTMLElement} button
	 */
	#showRollCleared(button) {
		const display = button.closest(".roll-display")?.querySelector(".roll-value");
		if (display) display.textContent = "0";
	}

	static PARTS = {
		sheet: {
			template: "systems/usr/templates/actor/actor-trait-sheet.hbs",
			root: true,
		},
	};

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const trait = this.getStoredTrait();
		if (this.#clearedRolls.has("trait")) trait.roll = 0;
		const specConfig = CONFIG.usr.specializations[this.key] || {};
		const allSpecs = [];

		// Prepare existing specs
		const existingSpecs = new Map();
		trait.spec.forEach((s) => existingSpecs.set(s.title, s));

		// Add all specs from config
		for (const [slug, labelKey] of Object.entries(specConfig)) {
			const existing = existingSpecs.get(slug);
			allSpecs.push({
				slug,
				title: slug,
				localizedTitle: game.i18n.localize(labelKey),
				value: existing?.value ?? 0,
				modifier: existing?.modifier ?? 0,
				roll: this.#clearedRolls.has(slug) ? 0 : (existing?.roll ?? 0),
				xp: existing?.xp ?? 0,
				isLegacy: false,
			});
			existingSpecs.delete(slug);
		}

		// Add remaining legacy specs
		for (const [title, s] of existingSpecs) {
			allSpecs.push({
				slug: title,
				title: title,
				localizedTitle: title,
				value: s.value,
				modifier: s.modifier ?? 0,
				roll: this.#clearedRolls.has(title) ? 0 : (s.roll ?? 0),
				xp: s.xp ?? 0,
				isLegacy: true,
			});
		}

		return Object.assign(context, {
			trait,
			key: this.key,
			allSpecs,
		});
	}

	/** @override */
	async _onRender(context, options) {
		await super._onRender(context, options);
		this.window.content?.classList.add("trait-sheet");
	}

	/**
	 * Submit the current form state and close the sheet.
	 * @returns {Promise<void>}
	 */
	async _onSaveAndClose() {
		await this.submit();
		await this.close();
	}

	/**
	 * Update the local trait state from the submitted form.
	 * @param {SubmitEvent} event
	 * @param {HTMLFormElement} form
	 * @param {FormDataExtended} formData
	 * @returns {Promise<void>}
	 */
	async _onSubmitForm(event, form, formData) {
		const data = formData.object;
		const toInt = (value, fallback = 0) => {
			const n = Number.parseInt(value, 10);
			return Number.isFinite(n) ? n : fallback;
		};

		// Start from the stored trait so roll counters gained while the editor
		// was open are preserved; only fields shown in the form are overwritten.
		const trait = this.getStoredTrait();
		trait.value = Math.max(1, toInt(data.value, trait.value));
		trait.modifier = toInt(data.modifier, trait.modifier);
		trait.xp = Math.max(0, toInt(data.xp, trait.xp));
		if (this.#clearedRolls.has("trait")) trait.roll = 0;

		if (trait.hasSpec) {
			const stored = new Map(trait.spec.map((s) => [s.title, s]));
			const specConfig = CONFIG.usr.specializations[this.key] || {};
			const slugs = new Set([...Object.keys(specConfig), ...stored.keys()]);
			const spec = [];

			for (const slug of slugs) {
				const existing = stored.get(slug);
				const valueField = data[`spec-${slug}-value`];

				// Not in the form (e.g. gained by a roll while open): keep as stored.
				if (valueField === undefined) {
					if (existing) spec.push(existing);
					continue;
				}

				// A level of 0 means the specialization is not learned.
				const value = toInt(valueField);
				if (value < 1) continue;

				spec.push({
					title: slug,
					value,
					modifier: toInt(data[`spec-${slug}-modifier`]),
					roll: this.#clearedRolls.has(slug) ? 0 : (existing?.roll ?? 0),
					xp: Math.max(0, toInt(data[`spec-${slug}-xp`])),
				});
			}
			trait.spec = spec;
		}

		await this.updateActor(trait);
		this.#clearedRolls.clear();
	}

	/**
	 * Persist the edited trait back to the actor.
	 * @param {object} trait    The full trait data to store
	 * @returns {Promise<Actor>}
	 */
	updateActor(trait) {
		if (this.isCore) {
			const traits = foundry.utils.deepClone(this.actor.system.traits);
			traits[this.key] = trait;
			return this.actor.update({ "system.traits": traits });
		} else {
			const skillTraits = foundry.utils.deepClone(
				this.actor.system.toObject().skillTraits,
			);
			skillTraits[this.key] = trait;
			return this.actor.update({ "system.skillTraits": skillTraits });
		}
	}
}
