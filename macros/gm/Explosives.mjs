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

function distance(a, b, zA = 0) {
    return (
        (a.position.x - b.position.x) ** 2 +
        (a.position.y - b.position.y) ** 2 +
        ((zA != 0 ? zA : a.document.elevation) - b.document.elevation) ** 2
    ) ** 0.5;
}

let dialogContent = `
    <fieldset>
        <div>
            <label for="damge-field">Damage:</label>
            <input type="number" name="damage" id="damage-field" min="1" placeholder="42" required autofocus/>
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
                <option value="shaped180">Shaped 180°</option>
                <option value="shaped90">Shaped 90°</option>
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

if (!response.damge) {
    ui.notifications.error(`${MACRO_LABEL}: no number for damage provided. Damage number required.`, { permanent: true });
    return;
}

let damage = response.damage;
// for affected Tokens roll Fray
let tokens_affected = canvas.tokens.controlled; // do we need anything token-wise, or can we go straight to actors?
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

// produce some nice ChatMessage summary
ChatMessage.create({ content: chatMessageContent });