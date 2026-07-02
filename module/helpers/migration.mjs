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
	// We use the most raw data possible
	const source = actor.toObject(false);
	const system = source.system || {};
	const traits = system.traits || {};

	console.log(
		`USR | Migrating ${actor.name}. Traits keys found in source:`,
		Object.keys(traits),
	);

	const skillTraitKeys = CONFIG.usr.traits.skills;
	const skillTraits = system.skillTraits || {};
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

			// 1. If title is already a valid slug (case-insensitive check)
			if (specConfig[title]) {
				if (s.title !== title) {
					console.log(`USR | Normalizing spec slug: ${s.title} -> ${title}`);
					s.title = title;
				}
				return;
			}

			// 2. Try to find a slug that matches the localized label
			for (const [slug, labelKey] of Object.entries(specConfig)) {
				const label = game.i18n.localize(labelKey).trim().toLowerCase();
				if (title === label) {
					console.log(
						`USR | Migrating spec name to slug: ${s.title} -> ${slug}`,
					);
					s.title = slug;
					return;
				}
			}
		});
	};

	for (const key of skillTraitKeys) {
		// Check both in the 'traits' object and directly in system (just in case)
		const oldTrait = traits[key] || system[key];

		if (oldTrait) {
			// Only migrate if not already in skillTraits and if it has useful data
			if (
				!skillTraits[key] &&
				(oldTrait.value > 1 || (oldTrait.spec && oldTrait.spec.length > 0))
			) {
				console.log(`USR | Migrating ${key} trait data for ${actor.name}`);
				newSkillTraits[key] = foundry.utils.deepClone(oldTrait);
				if (!newSkillTraits[key].label?.startsWith("USR.")) {
					newSkillTraits[key].label = `USR.Trait${
						key.charAt(0).toUpperCase() + key.slice(1)
					}`;
				}
				// Migrate specs for this skill trait
				migrateSpecs(key, newSkillTraits[key]);
				hasNewSkills = true;
			}

			// Always clear the old data location in the update to prevent repeated migration
			updateData[`system.traits.-=${key}`] = null;
			updateData[`system.-=${key}`] = null;
		}
	}

	if (hasNewSkills) {
		updateData["system.skillTraits"] = {
			...skillTraits,
			...newSkillTraits,
		};
	}

	// Update core trait labels to localization keys and migrate specs
	for (const key of CONFIG.usr.traits.core) {
		const trait = traits[key];
		if (trait) {
			if (typeof trait.label === "string" && !trait.label.startsWith("USR.")) {
				updateData[`system.traits.${key}.label`] = `USR.Trait${
					key.charAt(0).toUpperCase() + key.slice(1)
				}`;
			}
			// Clone trait and migrate specs
			const updatedTrait = foundry.utils.deepClone(trait);
			migrateSpecs(key, updatedTrait);

			// Only update if specs actually changed
			if (JSON.stringify(updatedTrait.spec) !== JSON.stringify(trait.spec)) {
				updateData[`system.traits.${key}.spec`] = updatedTrait.spec;
			}
		}
	}

	// Migrate Knowledge approval
	if (actor.system.knowledge) {
		let changed = false;
		const knowledge = actor.system.knowledge.map((k) => {
			if (k.approved === undefined) {
				changed = true;
				return { ...k, approved: true };
			}
			return k;
		});
		if (changed) {
			updateData["system.knowledge"] = knowledge;
		}
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
