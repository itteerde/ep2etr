const content = `
<form>
    <div class="form-group">
        <label for="num">Skill Name:</label>
        <div class="form-fields">
            <select id="skillName">${TREP2eDB.skills.filter(s => s.types.includes("Active")).reduce((acc, s) => { return acc + `<option value="${s.name}">${s.name}</option>` }, "")}</select>
        </div>
    </div>
</form>`;

const buttons = {
    heal: {
        icon: "<i class='fa-solid fa-hand-holding-heart'></i>",
        label: "Report",
        callback: async (html) => {
            const skillName = html[0].querySelector("#skillName").value;
            const skill = TREP2eDB.skills.find(s => s.name === skillName);

            await ChatMessage.create({ content: "<h3>" + skillName + "</h3><table>" + TRTacNet.shortenReportSkill(TRTacNet.reportSkill(skillName)).reduce((acc, e) => { return acc += `<tr><td>${e.name}</td><td>${e.roll}</td></tr>`; }, "") + "</table>" + `<div>Aptitude: ${skill.aptitude}</div><div>Types: ${skill.types.reduce((acc, t) => { return acc += t + ", " }, "")}</div>` });
            return;
        }
    }
}

new Dialog({ title: "Report Skill", content, buttons }).render(true);