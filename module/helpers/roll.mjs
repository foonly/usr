import {usr} from "./config.mjs";

export function usrRoll(data) {
    if (data.skill <= data.specialization) {
        data.specialization = data.skill - 1;
    }
    if (data.difficulty < 1 && data.difficulty > -2) {
        data.difficulty = -2;
    }

    const nr = Math.abs(data.difficulty);

    const roll = new Roll(`${nr}d10`);
    roll.evaluate({async: false});

    const result = {
        difficulty: data.difficulty,
        skill: data.skill,
        specialization: data.specialization,
        dice: [],
        successes: 0,
        critical: false,
        formula: '',
        total: '',
    }

    let ones = -1;
    let tens = -1;
    let failed = false;

    for (const die of roll.dice[0].results) {
        result.dice.push({value: die.result, success: die.result <= result.skill});
        if (result.difficulty < 0) {
            if (die.result > result.skill) {
                failed = true;
            }
        } else {
            if (die.result <= result.skill) {
                result.successes++;
            }
        }
        if (die.result <= result.specialization) {
            result.successes++;
        }
        if (die.result === 1) {
            ones++;
        }
        if (die.result === 10) {
            tens++;
        }
    }
    if (result.difficulty < 0) {
        if (failed) {
            result.successes = 0;
        } else {
            result.successes++;
        }
    }

    if (ones > 0) {
        result.successes += ones;
        result.critical = true;
    }

    if (tens > 0) {
        result.successes -= tens;
        if (result.successes < 1) {
            result.successes = 0;
            result.critical = true;
        }
    }

    result.formula = `Difficulty: ${result.difficulty} / Skill: ${result.skill}`;
    if (result.specialization > 0) {
        result.formula += ` (${result.specialization})`;
    }
    result.total = (result.critical ? 'Critical ' : '') + (result.successes ? result.successes + ' Successes' : 'Fail');

    const speaker = ChatMessage.getSpeaker({actor: data.actor});

    renderTemplate('systems/usr/templates/helpers/roll.html', result).then(content => {
        // Prepare chat data
        const messageData = {
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            content,
            sound: CONFIG.sounds.dice,
            speaker,
            flavor: data.flavor,
        };

        const msg = new ChatMessage(messageData);

        ChatMessage.create(msg.toObject(), {rollMode: game.settings.get("core", "rollMode")});
    })

    return result;
}

export function makeRoll(data) {
    if (data.actor.system.traits) {
        data.traits = [];
        Object.keys(data.actor.system.traits).forEach(key => {
            const trait = data.actor.system.traits[key];
            data.traits.push({
                key: key,
                label: trait.label,
                value: trait.value,
                active: (trait.label === data.label),
            });
            if (trait.hasSpec) {
                trait.spec.forEach((spec, index) => {
                    data.traits.push({
                        key: key,
                        label: ` - ${spec.title}`,
                        value: `${trait.value}/${spec.value}`,
                        active: (spec.title === data.label),
                    });
                })
            }
        })
    }
    data.difficulty = usr.difficulty;
    renderTemplate('systems/usr/templates/helpers/roll-dialog.html', data).then(content => {
        let d = new Dialog({
            title: "Custom Roll",
            content,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-dice-d10"></i>',
                    label: "Roll",
                    callback: (html) => {
                        const flavor = html.find("#label")[0].innerHTML ?? 'Custom';
                        const difficulty = parseInt(html.find("#difficulty")[0].value ?? 1);
                        const trait = (html.find("#trait")[0].value ?? '1').split('/');
                        const skill = parseInt(trait[0]??1);
                        const specialization = parseInt(trait[1]??0);

                        usrRoll({
                            flavor,
                            difficulty,
                            skill,
                            specialization,
                            speaker: data.actor
                        });
                    }
                }
            },
            default: "roll",
        });
        d.options.classes = ["usr", "dialog", "roll"];
        d.render(true);
    });
}
