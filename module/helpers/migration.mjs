/**
 * The data migration level of the system.
 * Bump this when a change to a data model's migrateData() should be written
 * back to the documents stored in existing worlds. It is stored in the
 * "systemVersion" world setting once the world migration has completed.
 * @type {string}
 */
export const MIGRATION_VERSION = "1.9.1";

/**
 * Whether the world's stored data is older than the current migration level.
 * @returns {boolean}
 */
export function needsMigration() {
	const lastVersion = game.settings.get("usr", "systemVersion");
	return foundry.utils.isNewerVersion(MIGRATION_VERSION, lastVersion);
}

/**
 * Write the migrated data of every world Actor and Item back to the database.
 *
 * The data models' migrateData() methods already transform documents as they
 * load, and Foundry migrates the loaded data in place, so the original stored
 * data isn't available to compare against. Instead, each document's (already
 * migrated) system data is saved as a full replacement, which also removes
 * stale keys from the stored data.
 *
 * Unlinked token actors and compendium content are not rewritten; they are
 * still migrated in memory whenever they load.
 *
 * @returns {Promise<boolean>} Whether every document was migrated successfully
 */
export async function migrateWorld() {
	ui.notifications.info(
		`Migrating USR System data to version ${MIGRATION_VERSION}...`,
	);
	console.log(`USR | Starting migration to ${MIGRATION_VERSION}`);

	const options = { diff: false, recursive: false, render: false };
	let failures = 0;

	// World Actors and the Items they own
	for (const actor of game.actors) {
		try {
			const source = actor.toObject();
			await actor.update({ system: source.system }, options);
			const itemUpdates = source.items.map((i) => ({
				_id: i._id,
				system: i.system,
			}));
			if (itemUpdates.length > 0) {
				await actor.updateEmbeddedDocuments("Item", itemUpdates, options);
			}
		} catch (err) {
			failures++;
			console.error(`USR | Failed migration for Actor ${actor.name}:`, err);
		}
	}

	// World Items
	for (const item of game.items) {
		try {
			await item.update({ system: item.toObject().system }, options);
		} catch (err) {
			failures++;
			console.error(`USR | Failed migration for Item ${item.name}:`, err);
		}
	}

	if (failures > 0) {
		ui.notifications.error(
			`USR System migration failed for ${failures} document(s). See the console for details. It will be retried on the next load.`,
			{ permanent: true },
		);
		return false;
	}

	console.log("USR | System migration complete!");
	ui.notifications.info("USR System migration complete!");
	return true;
}
