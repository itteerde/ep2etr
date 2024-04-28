
const partyIds = [
    "FTcEjiRQ0DU6Wwpe", // EGR_2.71828
    "GWpcf0ilVIRkl17D", // Kumo Noire
    "I5zQ7SgKvicAwf1A", // Nilk Narf
    "W2s7B6H7vlv87OiX", // Sith
    "KetJuJd3Ufj4klCF" // SysRig.ExE
];

const macroLabel = "Report Dialog GM";
const width = 1000;

const party = partyIds.map(i => game.actors.get(i));
//console.log(party);

let dialogContent = `<div width=${width}px><h1>Summary</h1>`;
dialogContent += party.reduce(function (html, a) {
    return html + `
        <div class="chat-message message" style="display: flex; flex-direction: row; justify-content: space-evenly; align-items:left; align-content:center;">
            <div>${a.name}</div>
            <div>
                <i class="fa-solid fa-heart-pulse awesomeIcon" style="font-size: 18px;"></i> ${a.system.health.physical.value}/${a.system.health.physical.max}/${a.system.physical.dr}
            </div>
            <div>
                <i class="fa-regular fa-bandage awesomeIcon" style="font-size: 18px;"></i> ${a.system.physical.wounds === null ? 0 : a.system.physical.wounds} (${a.system.physical.wt})
            </div>
            <div>
                <i class="fa-solid fa-brain awesomeIcon" style="font-size: 18px;"></i> ${a.system.health.mental.value}/${a.system.health.mental.max}/${a.system.mental.ir}
            </div>
            <div>
                <i class="fa-regular fa-burst awesomeIcon" style="font-size: 18px;"></i> ${a.system.mental.trauma === null ? 0 : a.system.mental.trauma} (${a.system.mental.tt})
            </div>
            <div>
                A(E) ${a.system.physical.energyArmorTotal}
            </div>
            <div>
                A(K) ${a.system.physical.kineticArmorTotal}
            </div>
        </div>
    `;
}, ``);
dialogContent += "</div>"

let d = new Dialog({
    title: macroLabel,
    content: dialogContent,
    buttons: {
        one: {
            icon: '<i class="fas fa-check"></i>',
            label: "",
        },
    },
    default: "one"//,
    //render: html => console.log("Register interactivity in the rendered dialog"),
    //close: html => console.log("This always is logged no matter which option is chosen")
});
d.render(true, { width: width });

