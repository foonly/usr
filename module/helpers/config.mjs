export const usr = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */

usr.difficulty = [
	{ label: "6 - Routine", dice: 6, active: false },
	{ label: "5 - Easy", dice: 5, active: false },
	{ label: "4 - Normal", dice: 4, active: true },
	{ label: "3 - Tricky", dice: 3, active: false },
	{ label: "2 - Hard", dice: 2, active: false },
	{ label: "1 - Very Hard", dice: 1, active: false },
	{ label: "*2 - Extremely Hard", dice: -2, active: false },
	{ label: "*3 - Special", dice: -3, active: false },
	{ label: "*4 - Special", dice: -4, active: false },
];

usr.damageModifier = [
	0, // 0
	0, // 1
	0, // 2
	-1, // 3
	-1, // 4
	-2, // 5
	-2, // 6
	-3, // 7
	-3, // 8
	-4, // 9
	-4, // 10
	-10, // 11
	-10, // 12
];

usr.wounds = {
	x: { label: "Stun", hp: 0 },
	l: { label: "Light", hp: 3 },
	m: { label: "Moderate", hp: 7 },
	s: { label: "Serious", hp: 12 },
	d: { label: "Deadly", hp: 16 },
};

usr.health = ["Healthy", "Stable", "Unstable", "Critical", "Dead"];

usr.speak = ["None", "Basic", "Good", "Advanced"];

usr.write = ["None", "Basic", "Good", "Advanced"];

usr.knowledge = ["None", "Basic", "Good", "Advanced"];

usr.lethalityTypes = {
	stun: "USR.LethalityStun",
	light: "USR.LethalityLight",
	moderate: "USR.LethalityModerate",
	serious: "USR.LethalitySerious",
	deadly: "USR.LethalityDeadly",
};

usr.deflectDice = {
	none: "USR.None",
	d4: "d4",
	d6: "d6",
	d8: "d8",
};

usr.meleeSpecializations = {
	"": "USR.None",
	swords: "USR.SpecSwords",
	knives: "USR.SpecKnives",
	clubs: "USR.SpecClubs",
};

usr.rangedSpecializations = {
	"": "USR.None",
	rifles: "USR.SpecRifles",
	pistols: "USR.SpecPistols",
	throwing: "USR.SpecThrowing",
};

usr.rangeTables = {
	normal: [
		[2, 5, 15, 20, 30], // Acc 1
		[3, 7, 20, 33, 55], // Acc 2
		[4, 10, 25, 45, 80], // Acc 3
		[4, 13, 35, 60, 110], // Acc 4
		[4, 15, 45, 75, 130], // Acc 5
		[4, 15, 45, 75, 130], // Acc 6 (Assuming same as 5)
		[4, 15, 45, 75, 130], // Acc 7 (Assuming same as 5)
	],
	aimed: [
		[15, 25, 45, 60], // Acc 1
		[35, 60, 85, 100], // Acc 2
		[50, 90, 140, 180], // Acc 3
		[60, 100, 190, 350], // Acc 4
		[70, 130, 240, 500], // Acc 5
		[80, 150, 300, 700], // Acc 6
		[100, 180, 400, 900], // Acc 7
	],
};

usr.rangeLabels = {
	normal: [
		"USR.RangePB",
		"USR.RangeShort",
		"USR.RangeMedium",
		"USR.RangeLong",
		"USR.RangeVLong",
	],
	aimed: [
		"USR.RangeShort",
		"USR.RangeMedium",
		"USR.RangeLong",
		"USR.RangeVLong",
	],
};

usr.rangeDice = {
	normal: [6, 4, 3, 2, 1],
	aimed: [4, 3, 2, 1],
};

usr.hitLocationMelee = [
	{ roll: [2], label: "Head A", diceCost: -3, lethality: 2 },
	{ roll: [3], label: "Head B", diceCost: -3, lethality: 1 },
	{ roll: [4], label: "Arms A", diceCost: -2, lethality: -1 },
	{ roll: [5, 6, 7], label: "Arms B", diceCost: -2, lethality: -2 },
	{ roll: [8, 9, 10, 11, 12], label: "Torso A", diceCost: -1, lethality: 0 },
	{ roll: [13, 14], label: "Torso B", diceCost: -1, lethality: -1 },
	{ roll: [15, 16, 17, 18], label: "Legs B", diceCost: -2, lethality: -2 },
	{ roll: [19, 20], label: "Legs A", diceCost: -2, lethality: -1 },
];

usr.hitLocationRanged = [
	{ roll: [2], label: "Head A", lethality: "d" },
	{ roll: [3], label: "Head B", lethality: "s" },
	{ roll: [4, 5, 6], label: "Arms A", lethality: "m" },
	{ roll: [7], label: "Arms B", lethality: "l" },
	{ roll: [8], label: "Torso A", lethality: "d" },
	{ roll: [9, 10, 11, 12], label: "Torso B", lethality: "s" },
	{ roll: [13, 14], label: "Torso C", lethality: "m" },
	{ roll: [15, 16, 17, 18], label: "Legs B", lethality: "m" },
	{ roll: [19, 20], label: "Legs A", lethality: "s" },
];
