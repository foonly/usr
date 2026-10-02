/**
 * Find the combatant representing an actor in a combat.
 * Unlinked token actors are matched by their token, so several tokens of the
 * same base actor each resolve to their own combatant.
 * @param {Actor} actor
 * @param {Combat} [combat]     Defaults to the currently viewed combat
 * @returns {Combatant|undefined}
 */
export function getCombatant(actor, combat = game.combat) {
	if (!actor || !combat) return undefined;
	if (actor.isToken) {
		const token = actor.token;
		return combat.combatants.find(
			(c) => c.tokenId === token.id && c.sceneId === token.parent?.id,
		);
	}
	return combat.combatants.find((c) => c.actorId === actor.id);
}

/**
 * Get an actor's combat stance for the current round, if any.
 * @param {Actor} actor
 * @returns {string|undefined}  "aggressive", "neutral" or "defensive"
 */
export function getStance(actor) {
	return getCombatant(actor)?.getFlag("usr", "action.stance") || undefined;
}
