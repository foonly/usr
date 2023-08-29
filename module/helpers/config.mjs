export const usr = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
usr.abilities = {
    "str": "USR.AbilityStr",
    "dex": "USR.AbilityDex",
    "con": "USR.AbilityCon",
    "int": "USR.AbilityInt",
    "wis": "USR.AbilityWis",
    "cha": "USR.AbilityCha"
};

usr.abilityAbbreviations = {
    "str": "USR.AbilityStrAbbr",
    "dex": "USR.AbilityDexAbbr",
    "con": "USR.AbilityConAbbr",
    "int": "USR.AbilityIntAbbr",
    "wis": "USR.AbilityWisAbbr",
    "cha": "USR.AbilityChaAbbr"
};

usr.difficulty = [
    {"label": "Routine", "dice": 6, "active": false},
    {"label": "Easy", "dice": 5, "active": false},
    {"label": "Normal", "dice": 4, "active": true},
    {"label": "Tricky", "dice": 3, "active": false},
    {"label": "Hard", "dice": 2, "active": false},
    {"label": "Very Hard", "dice": 1, "active": false},
    {"label": "Extremely Hard", "dice": -2, "active": false},
];
