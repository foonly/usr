import {usr} from "../helpers/config.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class usrActor extends Actor {

    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    /** @override */
    prepareBaseData() {
        // Data modifications in this step occur before processing embedded
        // documents or derived data.
    }

    /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
        const actorData = this;
        const systemData = actorData.system;

        // Damage calculations.
        const monitor = [];
        for (let i = 0; i < 12; i++) {
            let modifier = (usr.damageModifier[i + 1] ?? -10).toString();
            if (modifier === "-10") {
                modifier = "X";
            }
            if (modifier === "0") {
                modifier = "";
            }
            monitor[i] = {
                value: "",
                modifier
            };
        }
        let damage = 0
        Object.keys(usr.wounds).reverse().forEach(type => {
            const oldDamage = damage;
            damage += systemData.health[type] ?? 0;
            if (damage > 12) {
                // Limit total damage to 12, dropping the least significant wounds.
                systemData.health[type] = 12 - oldDamage;
                damage = 12;
            }

            // Fill monitor.
            for (let i = oldDamage; i < (damage); i++) {
                monitor[i].value = type;
            }
        });

        const modifier = usr.damageModifier[damage] ?? -10;
        let modifierText = modifier.toString();
        if (modifier < -9) {
            modifierText = "X";
        } else if (modifier > -1) {
            modifierText = "None";
        }

        const resistance = {
            x: Math.ceil(systemData.traits.fortitude.value * .9),
            l: Math.ceil(systemData.traits.fortitude.value * .8),
            m: Math.ceil(systemData.traits.fortitude.value * .7),
            s: Math.ceil(systemData.traits.fortitude.value * .6),
            d: Math.ceil(systemData.traits.fortitude.value * .5),
        };

        systemData.damage = {
            damage,
            modifier,
            modifierText,
            resistance,
            monitor
        };

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        this._prepareCharacterData(actorData);
        this._prepareNpcData(actorData);
    }

    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(actorData) {
        if (actorData.type !== 'character') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;
    }

    /**
     * Prepare NPC type specific data.
     */
    _prepareNpcData(actorData) {
        if (actorData.type !== 'npc') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;
        //systemData.xp = (systemData.cr * systemData.cr) * 100;
    }

    /**
     * Override getRollData() that's supplied to rolls.
     */
    getRollData() {
        const data = super.getRollData();

        // Prepare character roll data.
        this._getCharacterRollData(data);
        this._getNpcRollData(data);

        return data;
    }

    /**
     * Prepare character roll data.
     */
    _getCharacterRollData(data) {
        if (this.type !== 'character') return;

        // Copy the ability scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
        if (data.abilities) {
            for (let [k, v] of Object.entries(data.abilities)) {
                data[k] = foundry.utils.deepClone(v);
            }
        }
    }

    /**
     * Prepare NPC roll data.
     */
    _getNpcRollData(data) {
        if (this.type !== 'npc') return;

        // Process additional NPC data here.
    }

}
