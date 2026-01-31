/**
 * Resolve the use of area of effect explosives with macro assisted. Note that the ep2e System is obfuscated and minimized, therefore completely unreadable. One could try to find important points with debugging, but everything would have to be trials and guesses. The code is not readable and there is no documentation.
 * 
 * Points we would have to find by debugging are either the DUR/DR and Armor, or the function to assign damage.
 */

// start the process
// place MeasuredTemplate ? https://foundryvtt.com/api/classes/foundry.canvas.placeables.MeasuredTemplate.html
// selection of affected Tokens (I tend to have the Macro tell the GM what to do, but have the GM select them, because otherwise we'd have to deal with cover and other exceptions)
// configure blast range

const MACRO_LABEL = 'Explosives AoE';

/**
 * Compute distance between a and b.
 * 
 * @param {*} a "source" for this macro
 * @param {*} b "affected" for this macro
 * @param {*} zA elevation of "source". Note that MeasuredTemplate has an elevation.
 * @returns the distance between a and b.
 */
function distance(a, b, zA = 0) {
    return (
        (a.position.x - b.position.x) ** 2 +
        (a.position.y - b.position.y) ** 2 +
        ((zA != 0 ? zA : a.document.elevation) - b.document.elevation) ** 2
    ) ** 0.5;
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

if (!response.damage) {
    ui.notifications.error(`${MACRO_LABEL}: no number for damage provided. Damage number required.`, { permanent: true });
    return;
}

if (!response.reduction || !Number.isInteger(response.reduction)) {
    ui.notifications.error(`${MACRO_LABEL}: Reduction must be a natural number >= 2.`, { permanent: true });
    return;
}

// save tokens as they will be deselected by dropping the ExtendedTemplate
let tokens_controlled = canvas.tokens.controlled; // do we need anything token-wise, or can we go straight to actors?

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
const template = ExtendedTemplate.fromData(data);
await template.drawPreview();



let damage = response.damage;
// for affected Tokens roll Fray
// for affected Tokens apply damage (what is the correct way to do that for the ep2e System?)

// wounds
// knockdowns

let armor_items = canvas.tokens.controlled[0].actor.items.filter(i => i.system.armorValues?.energy > 0 || i.system.armorValues?.kinetic > 0);
let armor = { energy: 0, kinetic: 0 };

if (canvas.tokens.controlled[0].actor.getFlag('ep2e', 'biological')) {
    await canvas.tokens.controlled[0].actor.setFlag(
        'ep2e',
        'biological.system.physicalHealth.damage',
        canvas.tokens.controlled[0].actor.getFlag('ep2e', 'biological.system.physicalHealth.damage') + 10
    );

    armor.energy += canvas.tokens.controlled[0].actor.getFlag('ep2e', 'biological.system.inherentArmor.energy');
    armor.kinetic += canvas.tokens.controlled[0].actor.getFlag('ep2e', 'biological.system.inherentArmor.kinetic');
}

if (canvas.tokens.controlled[0].actor.getFlag('ep2e', 'synthetic')) {
    await canvas.tokens.controlled[0].actor.setFlag(
        'ep2e',
        'synthetic.system.physicalHealth.damage',
        canvas.tokens.controlled[0].actor.getFlag('ep2e', 'synthetic.system.physicalHealth.damage') + 10);

    armor.energy += canvas.tokens.controlled[0].actor.getFlag('ep2e', 'synthetic.system.inherentArmor.energy');
    armor.kinetic += canvas.tokens.controlled[0].actor.getFlag('ep2e', 'synthetic.system.inherentArmor.kinetic');
}

armor_items.forEach(e => {
    armor.energy += e.system.armorValues.energy;
    armor.kinetic += e.system.armorValues.kinetic;
});

console.log(armor);

// do we do a preview Dialog?

// produce some nice ChatMessage summary
ChatMessage.create({ content: chatMessageContent });