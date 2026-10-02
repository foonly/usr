/**
 * Chat message creation options that apply the user's current roll mode.
 * v14 renamed the setting and option to messageMode; v13 uses rollMode.
 * Pass the result as the options argument of ChatMessage.create or Roll#toMessage.
 * @returns {object}
 */
export function messageModeOptions() {
	if (game.release.generation >= 14) {
		return { messageMode: game.settings.get("core", "messageMode") };
	}
	return { rollMode: game.settings.get("core", "rollMode") };
}
