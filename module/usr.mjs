/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 */

// Import Modules
import {UsrActor} from "./actor.mjs";
import {UsrItem} from "./item.mjs";
import {UsrItemSheet} from "./item-sheet.mjs";
import {UsrActorSheet} from "./actor-sheet.mjs";
import {preloadHandlebarsTemplates} from "./templates.mjs";
import {createusrMacro} from "./macro.mjs";
import {UsrToken, UsrTokenDocument} from "./token.mjs";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function () {
    console.log(`Initializing Simple usr System`);

    /**
     * Set an initiative formula for the system. This will be updated later.
     * @type {String}
     */
    CONFIG.Combat.initiative = {
        formula: "1d20",
        decimals: 2
    };

    game.usr = {
        UsrActor,
        createusrMacro
    };

    // Define custom Document classes
    CONFIG.Actor.documentClass = UsrActor;
    CONFIG.Item.documentClass = UsrItem;
    CONFIG.Token.documentClass = UsrTokenDocument;
    CONFIG.Token.objectClass = UsrToken;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("usr", UsrActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("usr", UsrItemSheet, {makeDefault: true});

    // Register system settings
    game.settings.register("usr", "macroShorthand", {
        name: "SETTINGS.SimpleMacroShorthandN",
        hint: "SETTINGS.SimpleMacroShorthandL",
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    // Register initiative setting.
    game.settings.register("usr", "initFormula", {
        name: "SETTINGS.SimpleInitFormulaN",
        hint: "SETTINGS.SimpleInitFormulaL",
        scope: "world",
        type: String,
        default: "1d20",
        config: true,
        onChange: formula => _simpleUpdateInit(formula, true)
    });

    // Retrieve and assign the initiative formula setting.
    const initFormula = game.settings.get("usr", "initFormula");
    _simpleUpdateInit(initFormula);

    /**
     * Update the initiative formula.
     * @param {string} formula - Dice formula to evaluate.
     * @param {boolean} notify - Whether or not to post nofications.
     */
    function _simpleUpdateInit(formula, notify = false) {
        const isValid = Roll.validate(formula);
        if (!isValid) {
            if (notify) ui.notifications.error(`${game.i18n.localize("SIMPLE.NotifyInitFormulaInvalid")}: ${formula}`);
            return;
        }
        CONFIG.Combat.initiative.formula = formula;
    }

    /**
     * Slugify a string.
     */
    Handlebars.registerHelper('slugify', function (value) {
        return value.slugify({strict: true});
    });

    /**
     * Capitalize a string.
     */
    Handlebars.registerHelper('capitalize', function (value) {
        return value[0].toUpperCase() + value.substring(1);
    });

    Handlebars.registerHelper('times', function (n, block) {
        let accum = '';
        for (let i = 1; i <= n; i++) {
            block.data.index = i;
            accum += block.fn(i);
        }
        return accum;
    });


    // Preload template partials
    await preloadHandlebarsTemplates();
});

/**
 * Macrobar hook.
 */
Hooks.on("hotbarDrop", (bar, data, slot) => createusrMacro(data, slot));

/**
 * Adds the actor template context menu.
 */
Hooks.on("getActorDirectoryEntryContext", (html, options) => {

    // Define an actor as a template.
    options.push({
        name: game.i18n.localize("SIMPLE.DefineTemplate"),
        icon: '<i class="fas fa-stamp"></i>',
        condition: li => {
            const actor = game.actors.get(li.data("documentId"));
            return !actor.isTemplate;
        },
        callback: li => {
            const actor = game.actors.get(li.data("documentId"));
            actor.setFlag("usr", "isTemplate", true);
        }
    });

    // Undefine an actor as a template.
    options.push({
        name: game.i18n.localize("SIMPLE.UnsetTemplate"),
        icon: '<i class="fas fa-times"></i>',
        condition: li => {
            const actor = game.actors.get(li.data("documentId"));
            return actor.isTemplate;
        },
        callback: li => {
            const actor = game.actors.get(li.data("documentId"));
            actor.setFlag("usr", "isTemplate", false);
        }
    });
});

/**
 * Adds the item template context menu.
 */
Hooks.on("getItemDirectoryEntryContext", (html, options) => {

    // Define an item as a template.
    options.push({
        name: game.i18n.localize("SIMPLE.DefineTemplate"),
        icon: '<i class="fas fa-stamp"></i>',
        condition: li => {
            const item = game.items.get(li.data("documentId"));
            return !item.isTemplate;
        },
        callback: li => {
            const item = game.items.get(li.data("documentId"));
            item.setFlag("usr", "isTemplate", true);
        }
    });

    // Undefine an item as a template.
    options.push({
        name: game.i18n.localize("SIMPLE.UnsetTemplate"),
        icon: '<i class="fas fa-times"></i>',
        condition: li => {
            const item = game.items.get(li.data("documentId"));
            return item.isTemplate;
        },
        callback: li => {
            const item = game.items.get(li.data("documentId"));
            item.setFlag("usr", "isTemplate", false);
        }
    });
});
