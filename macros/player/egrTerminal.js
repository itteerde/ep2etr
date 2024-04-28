let egrSrc = `assets/Tokens/Top%20Down/By%20Type/EGR/Explorenaut.webp`;

let text = `<p><span style="color: #00cc00; font-weight: bold;">/&gt; TacNet Info:</span> note possible <span style="color: #cc0000; font-weight: bold;">enemy sensor coverage</span> EGR_2.71828 could run scan if requested.</p><p>simulating alternate paths of action <span style="color: #cccccc;">(this might take while. ⧖ estimated time: 3 hours, 29 minutes, 8 seconds)</span>.</p>`;

ChatMessage.create({
    speaker: { alias: `egr@egr.psv` },
    content: `
        <div><img src="${egrSrc}"</div>
        <div style="width: fit-content; font-size: smaller; font-family: Courier New, monospace; text-align: left;">${text}</div>
    `
})


// setup Private Server population

let text = `
    <p><span style="color: #00cc00; font-weight: bold;">/&gt; sudo ***************** root</span>
    <p>/&gt; .\\init_defense.exe --clean=1</p>
    <p>/&gt; <span style="color: #00cc00;">1.1 ... 1.1.2 @def</span></p>
    <p>/&gt; .\\simulspace.exe --t_mult=60</p>
    <p>/&gt; <span style="color: #00cc00;">simulspace @60*t</span></p>
    <p>/&gt; .\\coe.exe | simulspace</p>
    <p>/&gt; <span style="color: #00cc00;">Council of EGR @ simulspace</span></p>
    <p>/&gt; </p>
`;

let text = `
    <p><span style="color: #00cc00; font-weight: bold;">/&gt; .\\touch dead_man_script</span>
`;

await ChatMessage.create({
    speaker: { alias: `egr@egr.psv` },
    content: `
        <div style="width: fit-content; font-size: smaller; font-family: Courier New, monospace; text-align: left;">${text}</div>
    `
});

ChatMessage.create({
    content: `
        <div style="width: fit-content; font-size: smaller; font-family: Courier New, monospace; text-align: left;"><span style="color: #00cc00; font-weight: bold;">@crew: EGR established mesh defense and analytics services. Also, SimulSpace is available for recreational activities.</span></div>
    `
});


let text = `
    <p><span style="color: #00cc00; font-weight: bold;">/&gt; model(habitat) | CoE</span></p>
`;
