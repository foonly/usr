const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheet } = foundry.applications.sheets;

/**
 * Extend the basic ItemSheet with some very simple modifications.
 */
export class usrItemSheet extends HandlebarsApplicationMixin(ItemSheet) {
	static DEFAULT_OPTIONS = {
		classes: ["usr", "sheet", "item"],
		position: {
			width: 520,
			height: 480,
		},
		window: {
			contentClasses: ["standard-form"],
			resizable: true,
		},
		form: {
			submitOnChange: true,
		},
	};

	static PARTS = {
		sheet: {
			template: "systems/usr/templates/item/item-sheet.hbs",
			root: true,
			scrollable: [".sheet-body"],
		},
	};

	static TABS = {
		primary: {
			tabs: [{ id: "description" }, { id: "attributes" }],
			initial: "description",
		},
	};

	get title() {
		return this.item.name || super.title;
	}

	get template() {
		const path = "systems/usr/templates/item";
		return `${path}/item-${this.item.type}-sheet.hbs`;
	}

	/* -------------------------------------------- */

	/** @override */
	_configureRenderParts(options) {
		const parts = super._configureRenderParts(options);
		parts.sheet.template = this.template;
		return parts;
	}

	/* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const itemData = this.item.toObject(false);
		const rollData = this.actor ? this.actor.getRollData() : {};
		const description = itemData.system.description ?? "";
		const enrichedDescription =
			await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				description,
				{
					relativeTo: this.item,
					rollData,
					secrets: this.item.isOwner,
				},
			);

		Object.assign(context, {
			item: itemData,
			system: itemData.system,
			flags: itemData.flags,
			owner: this.item.isOwner,
			rollData,
			documentUUID: this.item.uuid,
			enrichedDescription,
		});

		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	async _onRender(context, options) {
		await super._onRender(context, options);
		this.window.content?.classList.add("flexcol");
	}
}
