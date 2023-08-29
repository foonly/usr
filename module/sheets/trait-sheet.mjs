export class TraitSheet extends FormApplication {
    constructor(trait, key) {
        super(trait, {title: `Edit ${trait.label}`});
        this.key = key;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["usr", "sheet", "trait"],
            popOut: true,
            template: 'systems/usr/templates/actor/actor-trait-sheet.html',
            id: 'trait-edit-sheet',
            title: 'Edit Trait',
        });
    }

    getData() {
        // Send data to the template
        console.log(this);
        return {
            trait: this.object,
            key: this.key,
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _updateObject(event, formData) {
        console.log(formData.exampleInput);
    }
}
