/**
 * Change of strategy: Don't work with the System's obejects, but with what it expresses (for syncromization and persistence) in Core. It has to be a mixture of stuff from Actor (to be gotten as usual via canvase.tokens.controlled [.actor for each] or game.actors) and the System's Flags (actor.getFlag('ep2e', <theFlag>)). Modifications are to be written back accordingly, setFlag for the damage and wounds, likely everything needed for this Macro.
 * 
 * Note that getFlag is synchronous, but setFlag is async and needs to be waited for at least for some places (where the new value might be used later).
 */

const MACRO_LABEL = 'Explosives AoE';

class LibItteerdeEp2e {

    /**
     * 
     * @param {*} min minimum possible
     * @param {*} max maximum possible
     * @returns a random integer from min to max both inclusive using Math.random()
     */
    static randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static isCritical(roll) {
        if (roll % 10 == Math.floor(roll / 10)) {
            return true;
        }
        return false;
    }

    /**
     * Classifies the roll as success or failure.
     * 
     * @param {*} initiating_roll 
     * @param {*} initiating_target 
     * @param {*} affected_roll 
     * @param {*} affected_target 
     * @returns 1 if initiating party wins, 0 otherwise. Numberical for counting.
     */
    static classifyOpposed(initiating_roll, initiating_target, affected_roll, affected_target) {
    }

    /**
     * Classifies the roll as success or failure.
     * 
     * @param {*} roll 
     * @param {*} target 
     * @returns 1 if successful, otherwise 0. Numerical for counting.
     */
    static classifyUnOpposed(roll, target) {
        if (roll <= target) {
            return 1;
        }

        return 0;
    }

    /**
     * Compute distance between a and b.
     * 
     * @param {*} a "source" for this macro
     * @param {*} b "affected" for this macro
     * @param {*} zA elevation of "source". Note that MeasuredTemplate has an elevation.
     * @returns the distance between a and b.
     */
    static distance(a, b, zA = 0) {
        return (
            (a.position.x - b.position.x) ** 2 +
            (a.position.y - b.position.y) ** 2 +
            ((zA != 0 ? zA : a.document.elevation) - b.document.elevation) ** 2
        ) ** 0.5;
    }
}


// https://foundryvtt.com/api/classes/foundry.canvas.placeables.MeasuredTemplate.html
class ExtendedTemplate extends foundry.canvas.placeables.MeasuredTemplate {
    /**
     * Track the timestamp when the last mouse move event was captured.
     * @type {number}
     */
    #moveTime = 0;

    /* -------------------------------------------- */

    /**
     * The initially active CanvasLayer to re-activate after the workflow is complete.
     * @type {CanvasLayer}
     */
    #initialLayer;

    /* -------------------------------------------- */

    /**
     * Track the bound event handlers so they can be properly canceled later.
     * @type {object}
     */
    #events;

    /* -------------------------------------------- */

    static fromData(data) {
        // Prepare template data
        const templateData = foundry.utils.mergeObject({
            user: game.user.id,
            direction: 0,
            x: 0,
            y: 0,
            fillColor: game.user.color,
        }, data);
        // Return the template constructed from the item data
        const cls = CONFIG.MeasuredTemplate.documentClass;
        const template = new cls(templateData, { parent: canvas.scene });
        const object = new this(template);
        return object;
    }

    /* -------------------------------------------- */


    drawPreview() {
        const initialLayer = canvas.activeLayer;

        // Draw the template and switch to the template layer
        this.draw();
        this.layer.activate();
        this.layer.preview.addChild(this);

        // Hide the sheet that originated the preview
        this.actorSheet?.minimize();

        // Activate interactivity
        return this.activatePreviewListeners(initialLayer);
    }

    /* -------------------------------------------- */

    /**
     * Activate listeners for the template preview
     * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
     * @returns {Promise}                 A promise that resolves with the final measured template if created.
     */
    activatePreviewListeners(initialLayer) {
        return new Promise((resolve, reject) => {
            this.#initialLayer = initialLayer;
            this.#events = {
                cancel: this._onCancelPlacement.bind(this),
                confirm: this._onConfirmPlacement.bind(this),
                move: this._onMovePlacement.bind(this),
                resolve,
                reject,
                rotate: this._onRotatePlacement.bind(this)
            };

            // Activate listeners
            canvas.stage.on("mousemove", this.#events.move);
            canvas.stage.on("mousedown", this.#events.confirm);
            canvas.app.view.oncontextmenu = this.#events.cancel;
            canvas.app.view.onwheel = this.#events.rotate;
        });
    }

    /* -------------------------------------------- */

    /**
     * Shared code for when template placement ends by being confirmed or canceled.
     * @param {Event} event  Triggering event that ended the placement.
     */
    async _finishPlacement(event) {
        this.layer._onDragLeftCancel(event);
        canvas.stage.off("mousemove", this.#events.move);
        canvas.stage.off("mousedown", this.#events.confirm);
        canvas.app.view.oncontextmenu = null;
        canvas.app.view.onwheel = null;
        this.#initialLayer.activate();
    }

    /* -------------------------------------------- */

    /**
     * Move the template preview when the mouse moves.
     * @param {Event} event  Triggering mouse event.
     */
    _onMovePlacement(event) {
        event.stopPropagation();
        const now = Date.now(); // Apply a 20ms throttle
        if (now - this.#moveTime <= 20) return;
        const center = event.data.getLocalPosition(this.layer);
        const interval = canvas.grid.type === CONST.GRID_TYPES.GRIDLESS ? 0 : 2;
        const snapped = canvas.grid.getSnappedPosition(center.x, center.y, interval);
        this.document.updateSource({ x: snapped.x, y: snapped.y });
        this.refresh();
        this.#moveTime = now;
    }

    /* -------------------------------------------- */

    /**
     * Rotate the template preview by 3˚ increments when the mouse wheel is rotated.
     * @param {Event} event  Triggering mouse event.
     */
    _onRotatePlacement(event) {
        if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
        event.stopPropagation();
        const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
        const snap = event.shiftKey ? delta : 5;
        const update = { direction: this.document.direction + (snap * Math.sign(event.deltaY)) };
        this.document.updateSource(update);
        this.refresh();
    }

    /* -------------------------------------------- */

    /**
     * Confirm placement when the left mouse button is clicked.
     * @param {Event} event  Triggering mouse event.
     */
    async _onConfirmPlacement(event) {
        await this._finishPlacement(event);
        const interval = canvas.grid.type === CONST.GRID_TYPES.GRIDLESS ? 0 : 2;
        const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, interval);
        this.document.updateSource(destination);
        this.#events.resolve(canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]));
    }

    /* -------------------------------------------- */

    /**
     * Cancel placement when the right mouse button is clicked.
     * @param {Event} event  Triggering mouse event.
     */
    async _onCancelPlacement(event) {
        await this._finishPlacement(event);
        this.#events.reject();
    }
}

if (canvas.tokens.controlled.length === 0) {
    ui.notifications.warn(`${MACRO_LABEL}: no Tokens selected, aborting.`);
    return;
}

let dialogContent = `
    <fieldset>
        <div>
            <label for="damge-field">Damage:</label>
            <input type="number" name="damage" id="damage-field" min="1" placeholder="42" required autofocus/>
        </div>
        <div>
            <label for="reduction-field">Reduction per Meter:</label>
            <input type="number" name="reduction" id="reduction-field" min="2" step="1" value="2" required/>
        </div>
        <div>
            <label for="fray-field">Fray Target (not halved):</label>
            <input type="number" name="fray" id="fray-field" min="0" step="1" placeholder="69" required/>
        </div>
        <div>
            <label for="damagetype-select">Damage Type:</label>
            <select name="damagetype" id="damagetype-select">
                <option value="energy">Energy</option>
                <option value="kinetic">Kinetic</option>
            </select>
        </div>
        <div>
            <label for="shape-select">AoE Shape:</label>
            <select name="shape" id="shape-select">
                <option value="circle">Circle</option>
                <option value="cone180">Shaped 180°</option>
                <option value="cone90">Shaped 90°</option>
            </select>
        </div>
        <div>
            <label for="elevation-field">Elevation:</label>
            <input type="text" name="elevation" id="elevation-field" size="10" value="0"/>
        </div>
        <div>
            <label for="knockdown-checkbox">Resolve Knockdowns:</label>
            <input type="checkbox" name="knockdowns" id="knockdown-checkbox" checked/>
        </div>
        <div>
            <label for="pools-checkbox">Use Pools to Fray:</label>
            <input type="checkbox" name="pools" id="pools-checkbox" checked/>
        </div>
        <div>
            <label for="deleteTemplate-checkbox">Delete Template:</label>
            <input type="checkbox" name="deleteTemplate" id="deleteTemplate-checkbox" checked/>
        </div>
    </fieldset>
`;

// input required ignored, should validate input
const response = await foundry.applications.api.DialogV2.wait({
    window: { title: "Explosives AoE" },
    content: dialogContent,
    buttons: [{
        action: "detonate",
        label: "Detonate!",
        default: true,
        callback: (event, button, dialog) => new foundry.applications.ux.FormDataExtended(button.form).object // makes available the named (name) html elements
    }]
});
console.log({ response: response });

if (!response) {
    ui.notifications.info(`${MACRO_LABEL}: aborted, no updates to Tokens performed`);
    return;
}

let chatMessageContent = ``;
let log_data = []; // add the modifications in order to report to console or ChatMessage

if (!response.damage) {
    ui.notifications.error(`${MACRO_LABEL}: no number for damage provided. Damage number required.`, { permanent: true });
    return;
}

if (!response.reduction || !Number.isInteger(response.reduction)) {
    ui.notifications.error(`${MACRO_LABEL}: Reduction must be a natural number >= 2.`, { permanent: true });
    return;
}

// save tokens as they will be deselected by dropping the ExtendedTemplate
let tokens_controlled = canvas.tokens.controlled; // do we need anything token-wise, or can we go straight to actors? Guess it is always better to have more stuff to work with. If readability suffers create an even more local variable to make the property paths shorter.

let measuredTemplateShape = '';
let measuredTemplateAngle = 360;
if (response.shape.startsWith('cone')) {
    measuredTemplateShape = 'cone';
    measuredTemplateAngle = response.shape.slice(4);
} else {
    measuredTemplateShape = 'circle'
}

const data = {
    "t": measuredTemplateShape,
    "distance": Math.round(response.damage / response.reduction), // should probably be .ceil or .floor, but not sure which right now
    "direction": 66.36148710049312,
    "angle": measuredTemplateAngle,
    "borderColor": "#000000",
    "hidden": false,
    "flags": {}
};
let template = ExtendedTemplate.fromData(data);
template = (await template.drawPreview())[0];

console.log({ template: template });

let damage = response.damage; // not multipliers for shaped charges (coneN)
let fray_target = response.fray;

for (const t of tokens_controlled) {

    // filter the equipped armor items
    let armor_items = t.actor.items.filter(i => i.system.state.equipped && (i.system.armorValues?.energy > 0 || i.system.armorValues?.kinetic > 0));

    let wounds = { value: 0, effective: 0 };
    let wt = 0;
    let fray = t.actor.system.aptitudes.ref * 2 + t.actor.system.skills.fray.points; // Are we looking for specializations? If so we need a list.

    // aggregate the armor values
    let armor = { energy: 0, kinetic: 0 };
    if (t.actor.getFlag('ep2e', 'biological.type') === 'biological') {

        wounds.value = t.actor.getFlag(
            'ep2e',
            'biological.system.physicalHealth.wounds'
        );

        wounds.effective = wounds.value;
        if (t.actor.getFlag('ep2e', 'biological.system.painFilter')) {
            if (wounds.value >= 1) {
                wounds.effective = wounds.value - 1;
            }
        }

        wt = Math.round(t.actor.getFlag(
            'ep2e',
            'biological.system.physicalHealth.baseDurability'
        ) / 5);

        if (t.actor.getFlag('ep2e', 'biological.system.inherentArmor.energy')) {
            armor.energy += t.actor.getFlag('ep2e', 'biological.system.inherentArmor.energy');
        }
        if (t.actor.getFlag('ep2e', 'biological.system.inherentArmor.kinetic')) {
            armor.kinetic += t.actor.getFlag('ep2e', 'biological.system.inherentArmor.kinetic');
        }
    }
    if (t.actor.getFlag('ep2e', 'synthetic.type') === 'synthetic') {

        wounds.value = t.actor.getFlag(
            'ep2e',
            'synthetic.system.physicalHealth.wounds'
        );

        wounds.effective = wounds.value;
        if (t.actor.getFlag('ep2e', 'synthetic.system.painFilter')) {
            if (wounds.value >= 1) {
                wounds.effective = wounds.value - 1;
            }
        }

        wt = Math.round(t.actor.getFlag(
            'ep2e',
            'synthetic.system.physicalHealth.baseDurability'
        ) / 5);

        if (t.actor.getFlag('ep2e', 'synthetic.system.inherentArmor.energy')) {
            armor.energy += t.actor.getFlag('ep2e', 'synthetic.system.inherentArmor.energy');
        }
        if (t.actor.getFlag('ep2e', 'synthetic.system.inherentArmor.kinetic')) {
            armor.kinetic += t.actor.getFlag('ep2e', 'synthetic.system.inherentArmor.kinetic');
        }
    }

    // go over all armor items the actor has (see filter above) and aggregate the armor values.
    armor_items.forEach(e => {
        armor.energy += e.system.armorValues.energy;
        armor.kinetic += e.system.armorValues.kinetic;
    });

    //go over all equipped items modifying wt
    t.actor.items.filter(
        i => i.system.state.equipped && i.system?.passiveEffects?.find(pe => pe.stat === 'woundThreshold')
    ).forEach(i => {
        i.system.passiveEffects.filter(
            e => e.stat === 'woundThreshold'
        ).forEach(pe => {
            wt += pe.modifier;
        })
    });

    // Fray: Are there no Items modifying Fray?

    console.log({
        wounds: wounds,
        fray: fray,
        wt: wt,
        armor: armor

    });

    // Fray
    let fray_roll = LibItteerdeEp2e.randomInteger(0, 99);

    // apply damage

    let damage_effective = damage;
    if (response.damagetype === 'energy') {
        damage_effective -= armor.energy;
    } else {
        damage_effective -= armor.kinetic;
    }
    if (damage_effective < 0) {
        damage_effective = 0;
    }

    if (t.actor.getFlag('ep2e', 'biological')) {
        await t.actor.setFlag(
            'ep2e',
            'biological.system.physicalHealth.damage',
            t.actor.getFlag('ep2e', 'biological.system.physicalHealth.damage') + damage_effective
        );
    }

    if (t.actor.getFlag('ep2e', 'synthetic')) {

        await t.actor.setFlag(
            'ep2e',
            'synthetic.system.physicalHealth.damage',
            t.actor.getFlag('ep2e', 'synthetic.system.physicalHealth.damage') + damage_effective);
    }

    // wounds
    if (damage_effective >= wt) {
        if (t.actor.getFlag('ep2e', 'biological.type') === 'biological') {
            await t.actor.setFlag(
                'ep2e',
                'biological.system.physicalHealth.wounds',
                t.actor.getFlag('ep2e', 'biological.system.physicalHealth.wounds') + Math.floor(damage_effective / wt)
            );
        }
        if (t.actor.getFlag('ep2e', 'synthetic.type') === 'synthetic') {
            await t.actor.setFlag(
                'ep2e',
                'synthetic.system.physicalHealth.wounds',
                t.actor.getFlag('ep2e', 'synthetic.system.physicalHealth.wounds') + Math.floor(damage_effective / wt)
            );
        }
    }

    // knockdowns

    log_data.push({
        actor: t.actor,
        damage_dealt: damage,
        damage_taken: damage_effective
    });

    // maybe add scrolling text for effect
    canvas.interface.createScrollingText(t.position, `${damage_effective}`, { fill: '0xcc0000' });

}



// do we do a preview Dialog?

// produce some nice ChatMessage summary
chatMessageContent += `
    <div style="font-size: 12px;">
        <table>
            <tr>
                <th>Actor</th><th>Distance</th><th>Damage</th>
            </tr>
`;
log_data.forEach(e => {
    chatMessageContent += `
            <tr>
                <td>${e.actor.name}</td>
                <td>?</td>
                <td>
                    <span style="font-weight: bold; color: #ee0000;">${e.damage_taken}</span>
                    ( <span style="color: #aa0000;">${e.damage_dealt}</span> )
                </td>
            </tr>
    `;
});
chatMessageContent += `
        </table>
    </div>
`;
ChatMessage.create({ content: chatMessageContent });

// delete MeasuredTemplate. Should happen in all aborting cases if there are any after creating it, too
if (response.deleteTemplate) {
    template.delete();
}