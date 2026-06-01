import { usr } from "./config.mjs";

const { DialogV2 } = foundry.applications.api;

function getDialogValue(dialog, selector) {
	return dialog.element.querySelector(selector)?.value ?? "";
}

export async function useChip(data) {
	const confirmation = await DialogV2.confirm({
		content: `Are you sure you want to use your ${data.type} chip?`,
		rejectClose: false,
	});

	if (!confirmation) {
		return null;
	}

	const newChips = {
		white: data.actor.system.chips.white,
		green: data.actor.system.chips.green,
		blue: data.actor.system.chips.blue,
		red: data.actor.system.chips.red,
		black: data.actor.system.chips.black,
	};

	if (newChips[data.type] > 0) {
		newChips[data.type]--;
		data.actor.update({ "system.chips": newChips });
		return data.type;
	}
}

export async function editAsset(actor, index = -1) {
	const assets = actor.system.assets ?? [];
	let name = "";
	let amount = 0;
	if (index > -1) {
		const asset = assets[index];
		name = asset.name;
		amount = Number.parseInt(asset.amount, 10);
	}

	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/asset-dialog.hbs",
		{ name, amount },
	);

	return new DialogV2({
		classes: ["usr", "dialog", "language"],
		window: {
			title: "Asset",
		},
		content,
		buttons: [
			{
				action: "save",
				icon: "fa-solid fa-earth-europe",
				label: "Save",
				default: true,
				callback: (_event, _button, dialog) => {
					const name = getDialogValue(dialog, "#asset");
					const amount = Number.parseInt(
						getDialogValue(dialog, "#amount") || "0",
						10,
					);

					if (name.length) {
						if (index === -1) {
							assets.push({
								name,
								amount,
							});
						} else {
							const asset = assets[index];
							asset.name = name;
							asset.amount = amount;
						}
						actor.update({ "system.assets": assets });
					}
				},
			},
		],
	}).render({ force: true });
}

export async function editLanguage(actor, index = -1) {
	const languages = actor.system.languages ?? [];
	let name = "";
	let speak = 0;
	let write = 0;
	if (index > -1) {
		const language = languages[index];
		name = language.name;
		speak = Number.parseInt(language.speak, 10);
		write = Number.parseInt(language.write, 10);
	}

	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/language-dialog.hbs",
		{
			name,
			speakList: usr.speak.map((label, i) => {
				return { label, active: i === speak };
			}),
			writeList: usr.write.map((label, i) => {
				return { label, active: i === write };
			}),
		},
	);

	return new DialogV2({
		classes: ["usr", "dialog", "language"],
		window: {
			title: "Language",
		},
		content,
		buttons: [
			{
				action: "save",
				icon: "fa-solid fa-earth-europe",
				label: "Save",
				default: true,
				callback: (_event, _button, dialog) => {
					const name = getDialogValue(dialog, "#language");
					const speak = Number.parseInt(
						getDialogValue(dialog, "#speak") || "0",
						10,
					);
					const write = Number.parseInt(
						getDialogValue(dialog, "#write") || "0",
						10,
					);

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
						languages.sort(languageSort);
						actor.update({ "system.languages": languages });
					}
				},
			},
		],
	}).render({ force: true });
}

function languageSort(a, b) {
	if (a.speak !== b.speak) {
		return b.speak - a.speak;
	}
	if (a.write !== b.write) {
		return b.write - a.write;
	}
	if (a.name < b.name) {
		return -1;
	}
	if (a.name > b.name) {
		return 1;
	}
	return 0;
}

export async function editKnowledge(actor, index = -1) {
	const knowledge = actor.system.knowledge ?? [];
	let name = "";
	let level = 0;

	if (index > -1) {
		const know = knowledge[index];
		name = know.name;
		level = Number.parseInt(know.level, 10);
	}

	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/knowledge-dialog.hbs",
		{
			name,
			levelList: usr.knowledge.map((label, i) => {
				return { label, active: i === level };
			}),
		},
	);

	return new DialogV2({
		classes: ["usr", "dialog", "knowledge"],
		window: {
			title: "Knowledge",
		},
		content,
		buttons: [
			{
				action: "save",
				icon: "fa-solid fa-book",
				label: "Save",
				default: true,
				callback: (_event, _button, dialog) => {
					const name = getDialogValue(dialog, "#knowledge");
					const level = getDialogValue(dialog, "#level");
					if (name.length) {
						if (index === -1) {
							knowledge.push({
								name,
								level,
							});
						} else {
							knowledge[index].name = name;
							knowledge[index].level = level;
						}
						knowledge.sort(knowledgeSort);
						actor.update({ "system.knowledge": knowledge });
					}
				},
			},
		],
	}).render({ force: true });
}

function knowledgeSort(a, b) {
	if (a.level !== b.level) {
		return b.level - a.level;
	}
	if (a.name < b.name) {
		return -1;
	}
	if (a.name > b.name) {
		return 1;
	}
	return 0;
}
