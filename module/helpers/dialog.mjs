import { usr } from "./config.mjs";

const { DialogV2 } = foundry.applications.api;

function getDialogValue(dialog, selector) {
	return dialog.element.querySelector(selector)?.value ?? "";
}

export async function useChip(data) {
	const { actor, type } = data;

	if (type === "red") {
		const bleedingLevels = ["none", "low", "medium", "high"];
		const currentBleeding = actor.system.bleeding || "none";
		const canAdrenaline = currentBleeding !== "none";

		const buttons = [
			{
				action: "negate",
				label: "Negate Damage (Pre-Resist)",
				icon: "fa-solid fa-shield-halved",
				callback: () => "negate",
			},
			{
				action: "adrenaline",
				label: "Adrenaline Clench (Reduce Bleeding)",
				icon: "fa-solid fa-heart-pulse",
				disabled: !canAdrenaline,
				callback: () => "adrenaline",
			},
			{
				action: "generic",
				label: "Other / Narrative",
				icon: "fa-solid fa-dice",
				callback: () => "generic",
			},
		];

		const action = await new DialogV2({
			window: { title: "Use Red Fate Chip" },
			content: "<p>Select how you want to use your Red Chip:</p>",
			buttons,
			classes: ["usr", "dialog"],
		}).render({ force: true });

		if (!action) return null;

		// Handle Adrenaline Clench immediately
		if (action === "adrenaline") {
			const currentIndex = bleedingLevels.indexOf(currentBleeding);
			const newBleeding = bleedingLevels[Math.max(0, currentIndex - 1)];
			await actor.update({
				"system.bleeding": newBleeding,
				"system.chips.red": actor.system.chips.red - 1,
			});
			return "Adrenaline Clench (Reduced Bleeding)";
		}

		// For negate or generic, we just subtract the chip and return the label
		if (actor.system.chips.red > 0) {
			await actor.update({ "system.chips.red": actor.system.chips.red - 1 });
			return action === "negate"
				? "Damage Negation (Halve Incoming Damage)"
				: "Red Fate Chip";
		}
		return null;
	}

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
	let approved = true;

	if (index > -1) {
		const know = knowledge[index];
		name = know.name;
		level = Number.parseInt(know.level, 10);
		approved = know.approved !== false;
	}

	const categories = Object.entries(usr.knowledgeCategories).reduce(
		(acc, [slug, labelKey]) => {
			acc[slug] = game.i18n.localize(labelKey);
			return acc;
		},
		{},
	);

	// Add world knowledge from settings
	const worldKnowledge = game.settings.get("usr", "worldKnowledge");
	if (worldKnowledge) {
		worldKnowledge.split(",").forEach((k) => {
			const trimmed = k.trim();
			if (trimmed) categories[trimmed] = trimmed;
		});
	}

	const content = await foundry.applications.handlebars.renderTemplate(
		"systems/usr/templates/helpers/knowledge-dialog.hbs",
		{
			name,
			categories,
			levelList: usr.knowledge.map((label, i) => {
				return { label, active: i === level };
			}),
			showApproval: game.user.isGM,
			approved,
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
					let name = getDialogValue(dialog, "#knowledge");
					const selectValue = getDialogValue(dialog, "#knowledge-select");
					if (selectValue) {
						name = categories[selectValue];
					}
					const level = Number.parseInt(getDialogValue(dialog, "#level"), 10);
					const approvedElement = dialog.element.querySelector("#approved");
					const isApproved = approvedElement ? approvedElement.checked : true;

					if (name.length) {
						if (index === -1) {
							knowledge.push({
								name,
								level,
								approved: isApproved,
							});
						} else {
							knowledge[index].name = name;
							knowledge[index].level = level;
							knowledge[index].approved = isApproved;
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
