// DO NOT TRY THIS AT HOME (don't use unless right after backup!)
// https://discord.com/channels/170995199584108546/699750150674972743/1176590023563427841

const journalEntry = await fromUuid("Compendium.tablerules.tablerules-book.JournalEntry.6fjV3w6cbOtx1U3l");
const pages = journalEntry.pages.contents;
const sorted = pages.toSorted((a, b) => a.name.localeCompare(b.name));
const updates = sorted.map((e, i) => ({ _id: e.id, sort: 0 + i * CONST.SORT_INTEGER_DENSITY }));
await journalEntry.updateEmbeddedDocuments("JournalEntryPage", updates);


