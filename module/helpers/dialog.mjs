import { usr } from "./config.mjs";

export function editLanguage(actor, index = -1) {
  const languages = actor.system.languages ?? [];
  let name = "";
  let speak = 0;
  let write = 0;
  if (index > -1) {
    const language = languages[index];
    name = language.name;
    speak = parseInt(language.speak);
    write = parseInt(language.write);
  }
  const data = {
    name,
    speakList: usr.speak.map((label, i) => {
      return { label, active: i === speak };
    }),
    writeList: usr.write.map((label, i) => {
      return { label, active: i === write };
    }),
  };

  renderTemplate(
    "systems/usr/templates/helpers/language-dialog.hbs",
    data
  ).then((content) => {
    let d = new Dialog({
      title: "Language",
      content,
      buttons: {
        save: {
          icon: '<i class="fas fa-earth-europe"></i>',
          label: "Save",
          callback: (html) => {
            const name = html.find("#language")[0].value;
            const speak = parseInt(html.find("#speak")[0].value);
            const write = parseInt(html.find("#write")[0].value);

            if (name.length) {
              if (index === -1) {
                languages.push({
                  name,
                  speak,
                  write,
                });
              } else {
                const language = languages[index];
                language.name = name;
                language.speak = speak;
                language.write = write;
              }
              languages.sort((a, b) => {
                return b.speak - a.speak;
              });
              actor.update({ "system.languages": languages });
            }
          },
        },
      },
      default: "save",
    });
    d.options.classes = ["usr", "dialog", "language"];
    d.render(true);
  });
}

export function editKnowledge(actor, index = -1) {
  const data = {
    levels: usr.knowledge,
  };

  renderTemplate(
    "systems/usr/templates/helpers/knowledge-dialog.hbs",
    data
  ).then((content) => {
    let d = new Dialog({
      title: "Knowledge",
      content,
      buttons: {
        save: {
          icon: '<i class="fas fa-book"></i>',
          label: "Save",
          callback: (html) => {
            const name = html.find("#knowledge")[0].value;
            const level = html.find("#level")[0].value;
            const knowledge = actor.system.knowledge ?? [];
            if (name.length) {
              knowledge.push({
                name,
                level,
              });
              actor.update({ "system.knowledge": knowledge });
            }
          },
        },
      },
      default: "save",
    });
    d.options.classes = ["usr", "dialog", "knowledge"];
    d.render(true);
  });
}
