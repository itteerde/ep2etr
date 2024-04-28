const damage = 1; // change this for making the suite of Macros needed
const type = "dur"; // [dur|str], only for display

const tokens = canvas.tokens.controlled;

if (canvas.tokens.controlled.length === 0) {
    ui.notifications.info("0 Tokens selected, returning.");
    return;
}

ChatMessage.create({
    content: `Dealing damage (${damage} ${type}) to ${tokens.reduce(
        (names, token) => (
            names += token.actor.name + ", "
        ), ``
    )}`,
});

tokens.forEach(t => {
    t.actor.update({ "system.health.physical.value": t.actor.system.health.physical.value + damage });
});
