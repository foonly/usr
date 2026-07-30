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

usr.specializations = {
	mobility: {
		stealth: "USR.SpecStealth",
		running: "USR.SpecRunning",
		climbing: "USR.SpecClimbing",
		swimming: "USR.SpecSwimming",
		acrobatics: "USR.SpecAcrobatics",
		jumping: "USR.SpecJumping",
	},
	melee: {
		unarmed: "USR.SpecUnarmed",
		axes: "USR.SpecAxes",
		swords: "USR.SpecSwords",
		knives: "USR.SpecKnives",
		clubs: "USR.SpecClubs",
		bayonets: "USR.SpecBayonets",
		whips: "USR.SpecWhips",
	},
	ranged: {
		rifles: "USR.SpecRifles",
		pistols: "USR.SpecPistols",
		shotguns: "USR.SpecShotguns",
		artillery: "USR.SpecArtillery",
		bows: "USR.SpecBows",
		thrown: "USR.SpecThrown",
		muskets: "USR.SpecMuskets",
		crossbows: "USR.SpecCrossbows",
	},
	medicine: {
		firstAid: "USR.SpecFirstAid",
		surgery: "USR.SpecSurgery",
		treatment: "USR.SpecTreatment",
		assessment: "USR.SpecAssessment",
		pharmacology: "USR.SpecPharmacology",
		veterinary: "USR.SpecVeterinary",
		forensics: "USR.SpecForensics",
		psychiatry: "USR.SpecPsychiatry",
	},
	engineering: {
		architecture: "USR.SpecArchitecture",
		fortifications: "USR.SpecFortifications",
		mechanics: "USR.SpecMechanics",
		chemistry: "USR.SpecChemistry",
		steamEngines: "USR.SpecSteamEngines",
		civilEngineering: "USR.SpecCivilEngineering",
		explosives: "USR.SpecExplosives",
		telegraphy: "USR.SpecTelegraphy",
	},
	charisma: {
		entertainment: "USR.SpecEntertainment",
		persuasion: "USR.SpecPersuasion",
		leadership: "USR.SpecLeadership",
		acting: "USR.SpecActing",
		gambling: "USR.SpecGambling",
		rhetoric: "USR.SpecRhetoric",
		intimidation: "USR.SpecIntimidation",
		haggling: "USR.SpecHaggling",
		etiquette: "USR.SpecEtiquette",
		diplomacy: "USR.SpecDiplomacy",
	},
	animals: {
		falconry: "USR.SpecFalconry",
		riding: "USR.SpecRiding",
		dogs: "USR.SpecDogs",
		training: "USR.SpecTraining",
		breaking: "USR.SpecBreaking",
		herding: "USR.SpecHerding",
	},
	subterfuge: {
		lockpicking: "USR.SpecLockpicking",
		pickpocketing: "USR.SpecPickpocketing",
		camouflage: "USR.SpecCamouflage",
		forgery: "USR.SpecForgery",
		disguise: "USR.SpecDisguise",
		safeCracking: "USR.SpecSafeCracking",
		sleightOfHand: "USR.SpecSleightOfHand",
		shadowing: "USR.SpecShadowing",
	},
	craftsmanship: {
		smithing: "USR.SpecSmithing",
		carpentry: "USR.SpecCarpentry",
		cooking: "USR.SpecCooking",
		tailoring: "USR.SpecTailoring",
		leatherworking: "USR.SpecLeatherworking",
		gunsmithing: "USR.SpecGunsmithing",
		printing: "USR.SpecPrinting",
		brewing: "USR.SpecBrewing",
	},
	survival: {
		traps: "USR.SpecTraps",
		tracking: "USR.SpecTracking",
		herbology: "USR.SpecHerbology",
		hunting: "USR.SpecHunting",
		fishing: "USR.SpecFishing",
		foraging: "USR.SpecForaging",
		scouting: "USR.SpecScouting",
		weatherSense: "USR.SpecWeatherSense",
	},
	naval: {
		navigation: "USR.SpecNavigation",
		sailing: "USR.SpecSailing",
		gunnery: "USR.SpecGunnery",
		piloting: "USR.SpecPiloting",
		rigging: "USR.SpecRigging",
		whaling: "USR.SpecWhaling",
	},
};

usr.bleedingLevels = {
	none: "USR.BleedingNone",
	low: "USR.BleedingLow",
	medium: "USR.BleedingMedium",
	high: "USR.BleedingHigh",
};

usr.traitMax = 7;
usr.weightUnit = "lbs";
usr.weightFactor = 1;
usr.traits = {
	core: [
		"fortitude",
		"intelligence",
		"initiative",
		"willpower",
		"awareness",
		"mobility",
		"melee",
		"ranged",
	],
	skills: [
		"medicine",
		"engineering",
		"charisma",
		"survival",
		"subterfuge",
		"animals",
		"craftsmanship",
		"naval",
	],
};

usr.knowledgeCategories = {
	history: "USR.KnowHistory",
	folklore: "USR.KnowFolklore",
	law: "USR.KnowLaw",
	literature: "USR.KnowLiterature",
	science: "USR.KnowScience",
	religion: "USR.KnowReligion",
	politics: "USR.KnowPolitics",
};

usr.contactLevels = [
	"USR.ContactLevel0",
	"USR.ContactLevel1",
	"USR.ContactLevel2",
	"USR.ContactLevel3",
];

usr.contactTypes = {
	individual: "USR.ContactTypeIndividual",
	group: "USR.ContactTypeGroup",
};

usr.rangeTables = {
	normal: [
		[2, 3, 6, 11, 15], // Acc 0
		[2, 5, 15, 20, 30], // Acc 1
		[3, 7, 20, 33, 55], // Acc 2
		[4, 10, 25, 45, 80], // Acc 3
		[4, 13, 35, 60, 110], // Acc 4
		[4, 15, 45, 75, 130], // Acc 5
		[4, 15, 45, 75, 130], // Acc 6 (Same as 5)
		[4, 15, 45, 75, 130], // Acc 7 (Same as 5)
	],
	aimed: [
		[4, 8, 15, 25], // Acc 0
		[12, 20, 35, 50], // Acc 1
		[25, 40, 60, 100], // Acc 2
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

usr.traumaTable = [
	{ total: 13, label: "USR.TraumaGlancingBlow", bleeding: "none" },
	{ total: 16, label: "USR.TraumaFalteringPain", bleeding: "none" },
	{ total: 18, label: "USR.TraumaFleshWound", bleeding: "low" },
	{ total: 20, label: "USR.TraumaGrizzledScar", bleeding: "medium" },
	{ total: 22, label: "USR.TraumaBluntTrauma", bleeding: "low" },
	{ total: 24, label: "USR.TraumaBoneFracture", bleeding: "low" },
	{ total: 26, label: "USR.TraumaArterialGash", bleeding: "high" },
	{ total: 29, label: "USR.TraumaTraumaticKnockout", bleeding: "medium" },
	{ total: 31, label: "USR.TraumaSevereNerveInjury", bleeding: "low" },
	{ total: 34, label: "USR.TraumaCatastrophicMaiming", bleeding: "high" },
	{ total: 100, label: "USR.TraumaDeathsDoor", bleeding: "high" },
];

usr.traumaSubTable = {
	head: {
		scar: "USR.TraumaHeadScar",
		fracture: "USR.TraumaHeadFracture",
		nerve: "USR.TraumaHeadNerve",
		maim: "USR.TraumaHeadMaim",
	},
	arms: {
		scar: "USR.TraumaArmsScar",
		fracture: "USR.TraumaArmsFracture",
		nerve: "USR.TraumaArmsNerve",
		maim: "USR.TraumaArmsMaim",
	},
	torso: {
		scar: "USR.TraumaTorsoScar",
		fracture: "USR.TraumaTorsoFracture",
		nerve: "USR.TraumaTorsoNerve",
		maim: "USR.TraumaTorsoMaim",
	},
	legs: {
		scar: "USR.TraumaLegsScar",
		fracture: "USR.TraumaLegsFracture",
		nerve: "USR.TraumaLegsNerve",
		maim: "USR.TraumaLegsMaim",
	},
};

usr.hitLocationMelee = [
	{ roll: [2], label: "Head A", diceCost: -3, lethality: 2 },
	{ roll: [3], label: "Head B", diceCost: -3, lethality: 1 },
	{ roll: [4], label: "Arms B", diceCost: -2, lethality: -2 },
	{ roll: [5, 6, 7], label: "Arms A", diceCost: -2, lethality: -1 },
	{ roll: [8, 9, 10, 11, 12], label: "Torso A", diceCost: -1, lethality: 1 },
	{ roll: [13, 14], label: "Torso B", diceCost: -1, lethality: 0 },
	{ roll: [15, 16, 17, 18], label: "Legs B", diceCost: -2, lethality: -1 },
	{ roll: [19, 20], label: "Legs A", diceCost: -2, lethality: 0 },
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
