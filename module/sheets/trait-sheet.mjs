export class TraitSheet extends FormApplication {
    constructor(trait, key, parent) {
        super(trait, {id: `trait-${key}-edit-sheet`, title: `Edit ${trait.label}`});
        this.key = key;
        this.parent = parent;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["usr", "sheet", "trait"],
            popOut: true,
            width: 400,
            height: 400,
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

        html.find(".add-spec").click(ev => {
            if (!Array.isArray(this.object.spec)) {
                this.object.spec = [];
            }
            this.object.spec.push({
                title: "",
                value: 0,
                roll: 0,
                xp: 0
            });

            this.render();
        });
    }

    async _updateObject(event, formData) {
        this.object.value = formData.value;
        this.object.roll = formData.roll;
        this.object.xp = formData.xp;
        if (this.object.hasSpec) {
            const spec = [];
            let nr = 0;
            while (formData[`spec-${nr}-title`]) {
                const title = formData[`spec-${nr}-title`];
                if (title.trim().length) {
                    spec.push({
                        title,
                        value: formData[`spec-${nr}-value`],
                        roll: formData[`spec-${nr}-roll`],
                        xp: formData[`spec-${nr}-xp`],
                    });
                }
                nr++;
            }
            this.object.spec = spec;
        }
        const traits = this.parent.system.traits;
        traits[this.key] = this.object;
        this.parent.update({"system.traits": traits});
    }
}
