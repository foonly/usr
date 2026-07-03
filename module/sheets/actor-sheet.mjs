import {
	onManageActiveEffect,
	prepareActiveEffectCategories,
} from "../helpers/effects.mjs";
import { makeRoll, rollChip, rollXp, usrRoll } from "../helpers/roll.mjs";
import { addDamage, addHealingPoints, removeStun } from "../helpers/damage.mjs";
import { TraitSheet } from "./trait-sheet.mjs";
import {
	editLanguage,
	editKnowledge,
	editAsset,
	useChip,
} from "../helpers/dialog.mjs";
import { usr } from "../helpers/config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheet } = foundry.applications.sheets;

/**
 * Extend the basic ActorSheet with some very simple modifications.
 */
export class usrActorSheet extends HandlebarsApplicationMixin(ActorSheet) {
	static DEFAULT_OPTIONS = {
		classes: ["usr", "sheet", "actor"],
		position: {
			width: 600,
			height: 600,
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
			template: "systems/usr/templates/actor/actor-character-sheet.hbs",
			root: true,
			scrollable: [".sheet-body"],
		},
	};

	static TABS = {
		primary: {
			tabs: [
				{ id: "bio" },
				{ id: "traits" },
				{ id: "combat" },
				{ id: "knowledge" },
				{ id: "items" },
			],
			initial: "traits",
		},
	};

	get title() {
		return this.actor.name || super.title;
	}

	get template() {
		return `systems/usr/templates/actor/actor-${this.actor.type}-sheet.hbs`;
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
		const actorData = this.actor.toObject(false);
		// Add derived data for the sheet
		actorData.system.damage = this.actor.system.damage;

		// Handle all traits localization and unification
		context.allTraits = [];

		// Helper to process a trait
		const processTrait = (key, traitData) => {
			const trait = foundry.utils.deepClone(traitData);
			trait.key = key;
			trait.localizedLabel = game.i18n.localize(trait.label);
			if (trait.spec) {
				const specConfig = usr.specializations[key];
				trait.spec.forEach((spec) => {
					spec.localizedTitle = specConfig?.[spec.title]
						? game.i18n.localize(specConfig[spec.title])
						: spec.title;
					spec.isLegacy = specConfig && !specConfig[spec.title];
				});
			}
			return trait;
		};

		// Core Traits
		for (const [key, trait] of Object.entries(actorData.system.traits)) {
			context.allTraits.push(processTrait(key, trait));
		}

		// Skill Traits
		const skillTraitKeys = CONFIG.usr.traits.skills;
		const savedSkillTraits = actorData.system.skillTraits || {};

		for (const key of skillTraitKeys) {
			const savedTrait = savedSkillTraits[key];
			const traitData = {
				label: `USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`,
				value: 1,
				xp: 0,
				roll: 0,
				hasSpec: true,
				spec: [],
				...savedTrait,
			};
			context.allTraits.push(processTrait(key, traitData));
		}

		const items = this.actor.items.map((item) => {
			const data = item.toObject(false);
			data.data = data.system;
			return data;
		});
		const biography = actorData.system.biography ?? "";
		const enrichedBiography =
			await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				biography,
				{
					relativeTo: this.actor,
					secrets: this.actor.isOwner,
				},
			);

		Object.assign(context, {
			actor: actorData,
			items,
			system: actorData.system,
			flags: actorData.flags,
			owner: this.actor.isOwner,
			rollData: this.actor.getRollData(),
			effects: prepareActiveEffectCategories(this.actor.effects),
			documentUUID: this.actor.uuid,
			enrichedBiography,
		});

		if (actorData.type === "character") {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		if (actorData.type === "npc") {
			this._prepareItems(context);
		}

		return context;
	}

	/**
	 * Organize and classify items for character sheets.
	 * @param {object} context The sheet rendering context.
	 */
	_prepareCharacterData(context) {
		context.chipsList = [];
		for (const color of Object.keys(context.system.chips)) {
			for (let i = 0; i < context.system.chips[color]; i++) {
				context.chipsList.push(color);
			}
		}
		context.languageList = context.system.languages.map((lang) => {
			return {
				name: lang.name,
				speak: usr.speak[lang.speak],
				write: usr.write[lang.write],
			};
		});
		context.knowledgeList = context.system.knowledge.map((know) => {
			return {
				name: know.name,
				level: usr.knowledge[know.level],
				approved: know.approved,
			};
		});
	}

	/**
	 * Organize and classify items for actor sheets.
	 * @param {object} context The sheet rendering context.
	 */
	_prepareItems(context) {
		const gear = [];
		const melee = [];
		const ranged = [];
		const armor = [];
		const equippedMelee = [];
		const equippedRanged = [];
		const equippedArmor = [];

		for (const item of context.items) {
			item.img ||= CONST.DEFAULT_TOKEN;
			if (item.type === "item") {
				gear.push(item);
			} else if (item.type === "melee") {
				melee.push(item);
				if (item.system.equipped) equippedMelee.push(item);
			} else if (item.type === "ranged") {
				ranged.push(item);
				if (item.system.equipped) equippedRanged.push(item);
				// Prepare range tables for combat cards
				const acc = Math.clamp(item.system.accuracy, 1, 7) - 1;
				item.rangeTables = {
					normal: usr.rangeTables.normal[acc].map((val, i) => ({
						label: usr.rangeLabels.normal[i],
						dice: usr.rangeDice.normal[i],
						value: val,
					})),
					aimed: usr.rangeTables.aimed[acc].map((val, i) => ({
						label: usr.rangeLabels.aimed[i],
						dice: usr.rangeDice.aimed[i],
						value: val,
					})),
				};
			} else if (item.type === "armor") {
				armor.push(item);
				if (item.system.equipped) equippedArmor.push(item);
			}
		}

		context.gear = gear;
		context.melee = melee;
		context.ranged = ranged;
		context.armor = armor;
		context.equippedMelee = equippedMelee;
		context.equippedRanged = equippedRanged;
		context.equippedArmor = equippedArmor;

		// Prepare Unarmed Attack
		const fortitude = context.system.traits.fortitude.value;
		const meleeTrait = context.system.traits.melee;
		let spec = "";

		// Check for Unarmed specialization
		if (meleeTrait?.spec) {
			const unarmedSpec = meleeTrait.spec.find(
				(s) => s.title.toLowerCase() === "unarmed",
			);
			if (unarmedSpec) spec = unarmedSpec.title;
		}

		context.unarmed = {
			name: game.i18n.localize("USR.Unarmed"),
			img: "icons/skills/melee/unarmed-punch-fist.webp",
			type: "melee",
			system: {
				damage: Math.round(fortitude * 0.75),
				lethality: "stun",
				defenseBonus: -1,
				reach: 0,
				specialization: spec,
			},
			isUnarmed: true,
		};
	}

	/* -------------------------------------------- */

	/** @override */
	async _onRender(context, options) {
		await super._onRender(context, options);

		this.element.classList.add(this.actor.type);
		this.window.content?.classList.add("flexcol", this.actor.type);

		const html = this.form ?? this.element;
		const on = (selector, handler) => {
			for (const element of html.querySelectorAll(selector)) {
				element.addEventListener("click", handler);
			}
		};

		on(".item-edit", (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			const item = this.actor.items.get(element.dataset.itemId);
			item?.sheet.render({ force: true });
		});

		on(".roll-dialog", (event) => {
			const element = event.currentTarget;
			makeRoll({
				label: element.dataset.label,
				skill: element.dataset.rollUsr,
				actor: this.actor,
			});
		});

		on(".edit-asset", (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			editAsset(this.actor, element.dataset.index ?? -1);
		});

		on(".edit-language", (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			editLanguage(this.actor, element.dataset.index ?? -1);
		});

		on(".edit-knowledge", (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			editKnowledge(this.actor, element.dataset.index ?? -1);
		});

		on(".add-heal", () => addHealingPoints(this.actor));
		on(".add-damage", () => addDamage(this.actor));
		on(".remove-stun", () => removeStun(this.actor));

		on(".roll-xp", (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			rollXp({
				actor: this.actor,
				trait: element.dataset.trait,
				spec: element.dataset.spec ?? "",
			});
		});

		on(".roll-chip", (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			rollChip(this.actor, element.dataset.rollChip);
		});

		on(".clickable-chip", async (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			const actor = this.actor;
			const result = await useChip({ actor, type: element.dataset.chip });
			if (!result) return;

			const speaker = ChatMessage.getSpeaker({ actor });
			const content = `Uses ${result} fate chip.`;
			const messageData = {
				user: game.user.id,
				content,
				speaker,
				flavor: "Fate Chip.",
			};

			const msg = new ChatMessage(messageData);
			ChatMessage.create(msg.toObject(), {
				rollMode: game.settings.get("core", "rollMode"),
			});
		});

		on(".rollable", this._onRoll.bind(this));

		if (!this.isEditable) return;

		on(".trait-edit", (event) => {
			const key = event.currentTarget.dataset.trait;
			const trait =
				this.actor.system.traits[key] || this.actor.system.skillTraits[key];
			new TraitSheet(trait, key, this.actor).render({ force: true });
		});

		on(".item-create", this._onItemCreate.bind(this));

		on(".item-delete", async (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			const item = this.actor.items.get(element.dataset.itemId);
			await item?.delete();
		});

		on(".item-toggle-equipped", async (event) => {
			event.preventDefault();
			const element = event.currentTarget;
			const item = this.actor.items.get(element.dataset.itemId);
			if (item) {
				await item.update({ "system.equipped": !item.system.equipped });
			}
		});

		on(".effect-control", (event) => onManageActiveEffect(event, this.actor));
	}

	/**
	 * Handle creating a new owned item for the actor using initial data defined in the HTML dataset.
	 * @param {Event} event The originating click event.
	 * @returns {Promise<Item>}
	 * @private
	 */
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const type = header.dataset.type;
		const data = foundry.utils.deepClone(header.dataset);
		const typeLabel = (type ?? "item").toString();
		const prettyType = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);

		const itemData = {
			name: `New ${prettyType}`,
			type: type ?? "item",
			system: data,
		};

		delete itemData.system.type;
		return Item.create(itemData, { parent: this.actor });
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event The originating click event.
	 * @private
	 */
	_onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (
			dataset.rollType &&
			(dataset.rollType === "item" ||
				dataset.rollType === "attack" ||
				dataset.rollType === "defend")
		) {
			const itemId = element.closest(".item")?.dataset.itemId;
			if (itemId === "unarmed") {
				const coreTraits = this.actor.system.traits;
				const skillTraits = this.actor.system.skillTraits;
				const fortitude = coreTraits.fortitude.value;
				const meleeTrait = coreTraits.melee;
				let spec = "";

				// Check for Unarmed specialization
				if (meleeTrait?.spec) {
					const unarmedSpec = meleeTrait.spec.find(
						(s) => s.title.toLowerCase() === "unarmed",
					);
					if (unarmedSpec) spec = unarmedSpec.title;
				}

				const unarmedData = {
					name: game.i18n.localize("USR.Unarmed"),
					type: "melee",
					system: {
						damage: Math.round(fortitude * 0.75),
						lethality: "stun",
						defenseBonus: -1,
						reach: 0,
						specialization: spec,
					},
					id: "unarmed",
				};

				if (dataset.rollType === "attack") {
					return usrRoll({
						actor: this.actor,
						trait: "melee",
						spec: spec,
						flavor: `${unarmedData.name} Attack`,
						difficulty: 4,
						item: unarmedData,
					});
				} else if (dataset.rollType === "defend") {
					let difficulty = 3; // Default (Neutral/Out of combat)
					let flavor = `${unarmedData.name} (Defend)`;
					if (game.combat) {
						const combatant = game.combat.combatants.find(
							(c) => c.actorId === this.actor.id,
						);
						const stance = combatant?.getFlag("usr", "action.stance");
						if (stance === "aggressive") difficulty = 2;
						else if (stance === "neutral") difficulty = 3;
						else if (stance === "defensive") difficulty = 4;

						if (stance) {
							const stanceLabel =
								stance.charAt(0).toUpperCase() + stance.slice(1);
							flavor += ` [${stanceLabel} Stance]`;
						}
					}

					return usrRoll({
						actor: this.actor,
						item: unarmedData,
						trait: "melee",
						spec: spec,
						flavor: flavor,
						difficulty: difficulty - 1,
						skipDamage: true,
					});
				}
			}
			const item = this.actor.items.get(itemId);
			if (item) return item.roll({ rollType: dataset.rollType });
		} else if (dataset.rollUsr) {
			let itemId = dataset.itemId;
			if (!itemId) {
				itemId = element.closest(".item")?.dataset.itemId;
			}
			const item = itemId ? this.actor.items.get(itemId) : null;
			usrRoll({
				actor: this.actor,
				item: item,
				difficulty: Number.parseInt(dataset.rollUsr, 10),
				trait: dataset.trait ?? "",
				spec: dataset.spec ?? "",
				flavor: dataset.label ?? "",
			});
			return true;
		} else if (dataset.roll) {
			const label = dataset.label ? `[ability] ${dataset.label}` : "";
			const roll = new Roll(dataset.roll, this.actor.getRollData());
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: label,
				rollMode: game.settings.get("core", "rollMode"),
			});
			return roll;
		}
	}
}
