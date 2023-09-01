export const usr = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */

usr.difficulty = [
    {"label": "Routine (6)", "dice": 6, "active": false},
    {"label": "Easy (5)", "dice": 5, "active": false},
    {"label": "Normal (4)", "dice": 4, "active": true},
    {"label": "Tricky (3)", "dice": 3, "active": false},
    {"label": "Hard (2)", "dice": 2, "active": false},
    {"label": "Very Hard (1)", "dice": 1, "active": false},
    {"label": "Extremely Hard (*2)", "dice": -2, "active": false},
    {"label": "Special (*3)", "dice": -3, "active": false},
    {"label": "Special (*4)", "dice": -4, "active": false},
];

usr.damageModifier = [
    0,  // 0
    0,  // 1
    0,  // 2
    -1, // 3
    -1, // 4
    -2, // 5
    -2, // 6
    -3, // 7
    -3, // 8
    -4, // 9
    -4, // 10
    -10,// 11
    -10,// 12
];

usr.wounds = {
    "x": {"label": "Stun", "hp": 0},
    "l": {"label": "Light", "hp": 3},
    "m": {"label": "Moderate", "hp": 7},
    "s": {"label": "Serious", "hp": 12},
    "d": {"label": "Deadly", "hp": 16},
}
