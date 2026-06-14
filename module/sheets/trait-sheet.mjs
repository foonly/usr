const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Edit a single trait on an actor using the Application V2 framework.
 */
export class TraitSheet extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(trait, key, actor, options = {}) {
		super(
			foundry.utils.mergeObject(
				{
					id: `trait-${key}-edit-sheet`,
					window: {
						title: `Edit ${game.i18n.localize(trait.label)}`,
					},
				},
				options,
			),
		);

		this.trait = foundry.utils.deepClone(trait);
		this.key = key;
		this.actor = actor;
	}

	static DEFAULT_OPTIONS = {
		classes: ["usr", "sheet", "trait"],
		tag: "form",
		position: {
			width: 400,
			height: 400,
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
			addSpec: this.prototype._onAddSpec,
			saveAndClose: this.prototype._onSaveAndClose,
		},
	};

	static PARTS = {
		sheet: {
			template: "systems/usr/templates/actor/actor-trait-sheet.hbs",
			root: true,
		},
	};

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const specConfig = CONFIG.usr.specializations[this.key] || {};
		const allSpecs = [];

		// Prepare existing specs
		const existingSpecs = new Map();
		if (Array.isArray(this.trait.spec)) {
			this.trait.spec.forEach((s) => existingSpecs.set(s.title, s));
		}

		// Add all specs from config
		for (const [slug, labelKey] of Object.entries(specConfig)) {
			const existing = existingSpecs.get(slug);
			allSpecs.push({
				slug,
				title: slug,
				localizedTitle: game.i18n.localize(labelKey),
				value: existing?.value ?? 0,
				roll: existing?.roll ?? 0,
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
				roll: s.roll,
				xp: s.xp,
				isLegacy: true,
			});
		}

		return Object.assign(context, {
			trait: this.trait,
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
	 * Submit the current form state, add a specialization, and re-render.
	 * @returns {Promise<void>}
	 */
	async _onAddSpec() {
		await this.submit();

		if (!Array.isArray(this.trait.spec)) {
			this.trait.spec = [];
		}

		this.trait.spec.push({
			title: "",
			value: 0,
			roll: 0,
			xp: 0,
		});

		await this.updateActor();
		await this.render({ force: true });
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

		this.trait.value = Number.parseInt(data.value ?? 0, 10);
		this.trait.roll = Number.parseInt(data.roll ?? 0, 10);
		this.trait.xp = Number.parseInt(data.xp ?? 0, 10);

		if (this.trait.hasSpec) {
			const spec = [];
			const specConfig = CONFIG.usr.specializations[this.key] || {};
			const slugs = new Set([
				...Object.keys(specConfig),
				...this.trait.spec.map((s) => s.title),
			]);

			for (const slug of slugs) {
				const val = Number.parseInt(data[`spec-${slug}-value`] ?? 0, 10);
				const roll = Number.parseInt(data[`spec-${slug}-roll`] ?? 0, 10);
				const xp = Number.parseInt(data[`spec-${slug}-xp`] ?? 0, 10);

				if (val > 0 || roll > 0 || xp > 0) {
					spec.push({ title: slug, value: val, roll, xp });
				}
			}
			this.trait.spec = spec;
		}

		await this.updateActor();
	}

	/**
	 * Persist the edited trait back to the actor.
	 * @returns {Promise<Actor>}
	 */
	updateActor() {
		const isCore = !!this.actor.system.traits[this.key];
		if (isCore) {
			const traits = foundry.utils.deepClone(this.actor.system.traits);
			traits[this.key] = this.trait;
			return this.actor.update({ "system.traits": traits });
		} else {
			const skillTraits = foundry.utils.deepClone(
				this.actor.system.toObject().skillTraits,
			);
			skillTraits[this.key] = this.trait;
			return this.actor.update({ "system.skillTraits": skillTraits });
		}
	}
}
