/**
 * Perform a system migration for the entire world.
 * @returns {Promise}
 */
export async function migrateWorld() {
	const systemVersion = game.system.version;
	// We only run migration if we haven't already or if version changed significantly
	// For now, we check if skillTraits exist on characters.
	ui.notifications.info(`Migrating USR System to version ${systemVersion}...`);

	for (const actor of game.actors) {
		try {
			const updateData = await migrateActorData(actor);
			if (!foundry.utils.isEmpty(updateData)) {
				console.log(`Migrating Actor ${actor.name}`, updateData);
				await actor.update(updateData);
			}
		} catch (err) {
			err.message = `Failed USR system migration for Actor ${actor.name}: ${err.message}`;
			console.error(err);
		}
	}

	for (const item of game.items) {
		try {
			const updateData = await migrateItemData(item);
			if (!foundry.utils.isEmpty(updateData)) {
				console.log(`Migrating Item ${item.name}`, updateData);
				await item.update(updateData);
			}
		} catch (err) {
			err.message = `Failed USR system migration for Item ${item.name}: ${err.message}`;
			console.error(err);
		}
	}

	ui.notifications.info("USR System migration complete!");
}

/**
 * Migrate a single Actor document to perform any transformations.
 * @param {Actor} actor
 * @returns {Object} The update data to apply
 */
async function migrateActorData(actor) {
	const updateData = {};

	// Migrate Traits to SkillTraits
	const traits = actor.system.traits;
	const skillTraits = actor.system.skillTraits || {};
	const skillTraitKeys = CONFIG.usr.traits.skills;

	for (const key of skillTraitKeys) {
		// If the trait exists in the old fixed traits but not in skillTraits
		if (traits[key] && !skillTraits[key]) {
			if (!updateData["system.skillTraits"]) updateData["system.skillTraits"] = {};
			updateData["system.skillTraits"][key] = traits[key];
			// Update label to localized key
			updateData["system.skillTraits"][key].label = `USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`;
		}
	}

	// Update core trait labels to localization keys
	for (const key of CONFIG.usr.traits.core) {
		if (traits[key] && !traits[key].label.startsWith("USR.")) {
			updateData[`system.traits.${key}.label`] = `USR.Trait${key.charAt(0).toUpperCase() + key.slice(1)}`;
		}
	}

	// Migrate Knowledge approval
	if (actor.system.knowledge) {
		const knowledge = actor.system.knowledge.map((k) => {
			if (k.approved === undefined) {
				return { ...k, approved: true };
			}
			return k;
		});
		updateData["system.knowledge"] = knowledge;
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
