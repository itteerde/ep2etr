/**
 * Resolve the use of area of effect explosives with macro assisted. Note that the ep2e System is obfuscated and minimized, therefore completely unreadable. One could try to find important points with debugging, but everything would have to be trials and guesses. The code is not readable and there is no documentation.
 * 
 * Points we would have to find by debugging are either the DUR/DR and Armor, or the function to assign damage.
 */

// start the process
// place MeasuredTemplate ? https://foundryvtt.com/api/classes/foundry.canvas.placeables.MeasuredTemplate.html
// selection of affected Tokens (I tend to have the Macro tell the GM what to do, but have the GM select them, because otherwise we'd have to deal with cover and other exceptions)
// configure blast range
// roll damage
// for affected Tokens roll Fray
canvas.tokens.controlled
canvas.tokens.controlled[0].actor
// for affected Tokens apply damage (what is the correct way to do that for the ep2e System?)
// produce some nice ChatMessage summary