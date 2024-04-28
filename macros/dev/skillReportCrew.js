// use with care. This should not destroy anything other than the JournalEntry itself, but it would lag a lot with players connected. Better use right after backup without players connected

const journalEntry = await fromUuid("JournalEntry.nvPwpZCN3IRuTwq2");
const crew = game.folders.find(f => f.name === "PC").contents;
const skills = TREP2eDB.skills;

let skillsAllContent = ``;
let skillsActiveContent = ``;
let skillsKnowContent = ``;

for (const skill of skills) {

    const page = journalEntry.pages.contents.find(p => p.name === skill.name);
    const content = "<table>" + TRTacNet.shortenReportSkill(TRTacNet.reportSkill(skill.name)).reduce((acc, e) => { return acc += `<tr><td>${e.name}</td><td>${e.roll}</td></tr>`; }, "") + "</table>" + `<div>Aptitude: ${skill.aptitude}</div><div>Types: ${skill.types.reduce((acc, t) => { return acc += t + ", " }, "")}</div>`;

    if (page === undefined) {
        await journalEntry.createEmbeddedDocuments("JournalEntryPage", [{ name: skill.name, type: "text", text: { content: content, format: 1, markdown: undefined } }]);

    } else {
        page.update({ content: "<p></p>" + content });
    }


    skillsAllContent += `<p></p><h3>${skill.name}</h3>` + content;
    if (skill.types.includes("Active")) {
        skillsActiveContent += `<p></p><h3>${skill.name}</h3>` + content;
    }
    if (skill.types.includes("Know")) {
        skillsKnowContent += `<p></p><h3>${skill.name}</h3>` + content;
    }

}

// update the *, Active, Know Pages
const pageSkillAll = journalEntry.pages.contents.find(p => p.name === `__Skills (*)`);
if (pageSkillAll === undefined) {
    await journalEntry.createEmbeddedDocuments("JournalEntryPage", [{ name: `__Skills (*)`, type: "text", text: { content: skillsAllContent, format: 1, markdown: undefined } }]);
} else {
    await pageSkillAll.update({ "text.content": skillsAllContent });
}

const pageSkillActive = journalEntry.pages.contents.find(p => p.name === `__Skills (Active)`);
if (pageSkillActive === undefined) {
    await journalEntry.createEmbeddedDocuments("JournalEntryPage", [{ name: `__Skills (Active)`, type: "text", text: { content: skillsActiveContent, format: 1, markdown: undefined } }]);
} else {
    await pageSkillActive.update({ "text.content": skillsActiveContent });
}

const pageSkillKnow = journalEntry.pages.contents.find(p => p.name === `__Skills (Know)`);
if (pageSkillKnow === undefined) {
    await journalEntry.createEmbeddedDocuments("JournalEntryPage", [{ name: `__Skills (Know)`, type: "text", text: { content: skillsKnowContent, format: 1, markdown: undefined } }]);
} else {
    await pageSkillKnow.update({ "text.content": skillsKnowContent });
}

if (journalEntry.pages.contents.find(p => p.name === `___home`) === undefined) {
    await journalEntry.createEmbeddedDocuments("JournalEntryPage", [{ name: `___home`, type: "text", text: { content: " ", format: 1, markdown: undefined } }]);
}

// sort JournalEntry
const pages = journalEntry.pages.contents;
const sorted = pages.toSorted((a, b) => a.name.localeCompare(b.name));
const updates = sorted.map((e, i) => ({ _id: e.id, sort: 0 + i * CONST.SORT_INTEGER_DENSITY }));
journalEntry.updateEmbeddedDocuments("JournalEntryPage", updates);



