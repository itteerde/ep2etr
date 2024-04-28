const macroLabel = `Active Effects Dialog`;

if (canvas.tokens.controlled.length !== 1) {
    ui.notifications.warn(`${macroLabel} works only with exactly one owned Token selected. ${canvas.tokens.controlled.length} Tokens controlled currently selected.`);
    return;
}
const token = canvas.tokens.controlled[0];
const actor = token.actor;

const content = `
<form>
    <div class="form-group">
    </div>
</form>
`;

// list all current ActiveEffects
// update them (empty id for deleting?)
// changes are an Array, so without really doing a complicated layout editing in place will probably not really work for them.