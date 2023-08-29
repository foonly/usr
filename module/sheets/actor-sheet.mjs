import {
    onManageActiveEffect,
    prepareActiveEffectCategories,
} from "../helpers/effects.mjs";
import {makeRoll, usrRoll} from "../helpers/roll.mjs";
import {TraitSheet} from "./trait-sheet.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class usrActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["usr", "sheet", "actor"],
            template: "systems/usr/templates/actor/actor-sheet.html",
            width: 600,
            height: 600,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "traits",
                },
            ],
        });
    }

    /** @override */
    get template() {
        return `systems/usr/templates/actor/actor-${this.actor.type}-sheet.html`;
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        const actorData = this.actor.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;

        // Prepare character data and items.
        if (actorData.type == "character") {
            this._prepareItems(context);
            this._prepareCharacterData(context);
        }

        // Prepare NPC data and items.
        if (actorData.type == "npc") {
            this._prepareItems(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        // Prepare active effects
        context.effects = prepareActiveEffectCategories(this.actor.effects);

        return context;
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterData(context) {
        // Handle ability scores.
        for (let [k, v] of Object.entries(context.system.abilities)) {
            v.label = game.i18n.localize(CONFIG.usr.abilities[k]) ?? k;
        }
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareItems(context) {
        // Initialize containers.
        const gear = [];
        const features = [];

        // Iterate through items, allocating to containers
        for (let i of context.items) {
            i.img = i.img || DEFAULT_TOKEN;
            // Append to gear.
            if (i.type === "item") {
                gear.push(i);
            }
            // Append to features.
            else if (i.type === "feature") {
                features.push(i);
            }
            // Append to spells.
            else if (i.type === "spell") {
                if (i.system.spellLevel != undefined) {
                    spells[i.system.spellLevel].push(i);
                }
            }
        }

        // Assign and return
        context.gear = gear;
        context.features = features;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find(".item-edit").click((ev) => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // Roll dialog.
        html.find(".roll-dialog").click((ev) => {
            const element = ev.currentTarget;
            const data = {
                label: element.dataset.label,
                skill: element.dataset.rollUsr,
                actor: this.actor,
            };
            makeRoll(data);

        });

        // Rollable abilities.
        html.find(".rollable").click(this._onRoll.bind(this));

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Edit trait
        html.find(".trait-edit").click(ev => {
            const key = ev.currentTarget.dataset.trait;
            const trait = this.actor.system.traits[key];
            console.log(trait);
            new TraitSheet(trait, key).render(true);
        });

        // Add Inventory Item
        html.find(".item-create").click(this._onItemCreate.bind(this));

        // Delete Inventory Item
        html.find(".item-delete").click((ev) => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.delete();
            li.slideUp(200, () => this.render(false));
        });

        // Active Effect management
        html
            .find(".effect-control")
            .click((ev) => onManageActiveEffect(ev, this.actor));

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = (ev) => this._onDragStart(ev);
            html.find("li.item").each((i, li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            system: data,
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system["type"];

        // Finally, create the item!
        return await Item.create(itemData, {parent: this.actor});
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        // Handle item rolls.
        if (dataset.rollType && dataset.rollType == "item") {
            const itemId = element.closest(".item").dataset.itemId;
            const item = this.actor.items.get(itemId);
            if (item) return item.roll();

            // USR Roll.
        } else if (dataset.rollUsr) {
            // Parse the value.
            const parts = dataset.rollUsr.split("/");

            // Set values from parsed data.
            const skill = parts[0];
            const difficulty = parts[1] ?? 4;
            const specialization = parts[2] ?? 0;

            const flavor = dataset.label ?? '';

            // Get data for the message.
            const speaker = ChatMessage.getSpeaker({actor: this.actor});
            console.log(speaker);

            // Make roll and calculate.
            usrRoll({speaker, flavor, skill, difficulty, specialization});

            return true;
        } else if (dataset.roll) {
            // Handle rolls that supply the formula directly.
            let label = dataset.label ? `[ability] ${dataset.label}` : "";
            let roll = new Roll(dataset.roll, this.actor.getRollData());
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({actor: this.actor}),
                flavor: label,
                rollMode: game.settings.get("core", "rollMode"),
            });
            return roll;
        }
    }
}
