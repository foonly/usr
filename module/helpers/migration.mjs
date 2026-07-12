/**
 * Perform a system migration for the entire world.
 * @returns {Promise}
 */
export async function migrateWorld() {
	const systemVersion = game.system.version;
	ui.notifications.info(`Migrating USR System to version ${systemVersion}...`);
	console.log(`USR | Starting migration to ${systemVersion}`);

	const actorUpdates = [];
	for (const actor of game.actors) {
		try {
			const updateData = await migrateActorData(actor);
			if (!foundry.utils.isEmpty(updateData)) {
				actorUpdates.push({ _id: actor.id, ...updateData });
			}
		} catch (err) {
			console.error(`USR | Failed migration for Actor ${actor.name}:`, err);
		}
	}

	if (actorUpdates.length > 0) {
		console.log(`USR | Migrating ${actorUpdates.length} Actors...`);
		await Actor.updateDocuments(actorUpdates);
	}

	const itemUpdates = [];
	for (const item of game.items) {
		try {
			const updateData = await migrateItemData(item);
			if (!foundry.utils.isEmpty(updateData)) {
				itemUpdates.push({ _id: item.id, ...updateData });
			}
		} catch (err) {
			console.error(`USR | Failed migration for Item ${item.name}:`, err);
		}
	}

	if (itemUpdates.length > 0) {
		console.log(`USR | Migrating ${itemUpdates.length} Items...`);
		await Item.updateDocuments(itemUpdates);
	}

	console.log("USR | System migration complete!");
	ui.notifications.info("USR System migration complete!");
}

/**
 * Migrate a single Actor document to perform any transformations.
 * @param {Actor} actor
 * @returns {Object} The update data to apply
 */
async function migrateActorData(actor) {
	const updateData = {};
	const source = actor.toObject(false);
	const system = source.system || {};
	const traits = system.traits || {};
	const skillTraits = system.skillTraits || {};

	const skillTraitKeys = CONFIG.usr.traits.skills;
	const newSkillTraits = {};
	let hasNewSkills = false;

	// Helper to migrate specializations to slugs
	const migrateSpecs = (traitKey, trait) => {
		if (!trait?.spec || !Array.isArray(trait.spec)) return;
		const specConfig = CONFIG.usr.specializations[traitKey];
		if (!specConfig) return;

		trait.spec.forEach((s) => {
			if (!s.title) return;
			const title = s.title.trim().toLowerCase();

			if (specConfig[title]) {
				if (s.title !== title) s.title = title;
				return;
			}

			for (const [slug, labelKey] of Object.entries(specConfig)) {
				const label = game.i18n.localize(labelKey).trim().toLowerCase();
				if (title === label) {
					s.title = slug;
					return;
				}
			}
		});
	};

	for (const key of skillTraitKeys) {
		const oldTrait = traits[key] || system[key];
		const existingTrait = skillTraits[key];

		if (oldTrait) {
			// Migrate if not in skillTraits, or if existing is incomplete
			if (!existingTrait || !existingTrait.value || !existingTrait.label) {
				console.log(`USR | Migrating ${key} for ${actor.name}`);
				newSkillTraits[key] = {
					label: `USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`,
					value: 1,
					xp: 0,
					roll: 0,
					hasSpec: true,
					spec: [],
					...foundry.utils.deepClone(oldTrait),
					...foundry.utils.deepClone(existingTrait || {}),
				};
				migrateSpecs(key, newSkillTraits[key]);
				hasNewSkills = true;
			}
			updateData[`system.traits.-=${key}`] = null;
			updateData[`system.-=${key}`] = null;
		} else if (
			existingTrait &&
			(!existingTrait.value || !existingTrait.label)
		) {
			// Fix incomplete data even if no oldTrait
			newSkillTraits[key] = {
				label: `USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`,
				value: 1,
				xp: 0,
				roll: 0,
				hasSpec: true,
				spec: [],
				...foundry.utils.deepClone(existingTrait),
			};
			hasNewSkills = true;
		}
	}

	if (hasNewSkills) {
		updateData["system.skillTraits"] = {
			...skillTraits,
			...newSkillTraits,
		};
	}

	// Core Traits
	for (const key of CONFIG.usr.traits.core) {
		const trait = traits[key];
		if (trait) {
			const updatedTrait = foundry.utils.deepClone(trait);
			migrateSpecs(key, updatedTrait);

			if (typeof trait.label === "string" && !trait.label.startsWith("USR.")) {
				updateData[`system.traits.${key}.label`] = `USR.Trait${
					key.charAt(0).toUpperCase() + key.slice(1)
				}`;
			}
			if (JSON.stringify(updatedTrait.spec) !== JSON.stringify(trait.spec)) {
				updateData[`system.traits.${key}.spec`] = updatedTrait.spec;
			}
		}
	}

	// Knowledge
	if (actor.system.knowledge) {
		let changed = false;
		const knowledge = actor.system.knowledge.map((k) => {
			if (k.approved === undefined) {
				changed = true;
				return { ...k, approved: true };
			}
			return k;
		});
		if (changed) updateData["system.knowledge"] = knowledge;
	}

	return updateData;
}

/**
 * Migrate a single Item document to perform any transformations.
 * @param {Item} item
 * @returns {Object} The update data to apply
 */
async function migrateItemData(item) {
	const updateData = {};

	// Migrate specialization strings to slugs
	if (
		(item.type === "melee" || item.type === "ranged") &&
		item.system.specialization
	) {
		const spec = item.system.specialization.toLowerCase();
		const specConfig = CONFIG.usr.specializations[item.type];

		// If it's already a slug, skip
		if (specConfig[spec]) return updateData;

		// Try to find a slug that matches the localized name
		for (const [slug, labelKey] of Object.entries(specConfig)) {
			const label = game.i18n.localize(labelKey).toLowerCase();
			if (spec === label) {
				updateData["system.specialization"] = slug;
				break;
			}
		}
	}

	return updateData;
}
