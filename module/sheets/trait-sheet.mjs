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
						title: `Edit ${trait.label}`,
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
		return Object.assign(context, {
			trait: this.trait,
			key: this.key,
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
	 * @param {import("../..//../../FoundryVTT/client/applications/ux/form-data-extended.mjs").default} formData
	 * @returns {Promise<void>}
	 */
	async _onSubmitForm(event, form, formData) {
		const data = formData.object;

		this.trait.value = Number.parseInt(data.value ?? 0, 10);
		this.trait.roll = Number.parseInt(data.roll ?? 0, 10);
		this.trait.xp = Number.parseInt(data.xp ?? 0, 10);

		if (this.trait.hasSpec) {
			const spec = [];
			let nr = 0;
			while (data[`spec-${nr}-title`] !== undefined) {
				const title = data[`spec-${nr}-title`];
				if (title.trim().length) {
					spec.push({
						title,
						value: Number.parseInt(data[`spec-${nr}-value`] ?? 0, 10),
						roll: Number.parseInt(data[`spec-${nr}-roll`] ?? 0, 10),
						xp: Number.parseInt(data[`spec-${nr}-xp`] ?? 0, 10),
					});
				}
				nr++;
			}
			this.trait.spec = spec;
		}

		await this.updateActor();
	}

	/**
	 * Persist the edited trait back to the actor.
	 * @returns {Promise<import("../../FoundryVTT/client/documents/actor.mjs").default>}
	 */
	updateActor() {
		const traits = foundry.utils.deepClone(this.actor.system.traits);
		traits[this.key] = this.trait;
		return this.actor.update({ "system.traits": traits });
	}
}
