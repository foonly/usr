import {usrRoll} from "./roll.mjs";
import {usr} from "./config.mjs";

export function editLanguage(actor, index = -1) {
    const data = {
        speak: usr.speak,
        write: usr.write
    };

    renderTemplate('systems/usr/templates/helpers/language-dialog.html', data).then(content => {
        let d = new Dialog({
            title: "Language",
            content,
            buttons: {
                save: {
                    icon: '<i class="fas fa-earth-europe"></i>',
                    label: "Save",
                    callback: (html) => {
                        const name = html.find("#language")[0].value;
                        const speak = html.find("#speak")[0].value;
                        const write = html.find("#write")[0].value;
                        const languages = actor.system.languages ?? [];
                        if (name.length) {
                            languages.push({
                                name,
                                speak,
                                write
                            });
                            actor.update({"system.languages": languages});
                        }
                    }
                }
            },
            default: "save",
        });
        d.options.classes = ["usr", "dialog", "language"];
        d.render(true);
    });

}