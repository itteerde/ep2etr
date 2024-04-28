# ep2eFVTT
Eclipse Phase 2nd Edition Foundry VTT -- Tablerules and Configuration Module



# Documentation

## General

+ [Foundry Virtual Tabletop - API Documentation - Version 11](https://foundryvtt.com/api/)
+ [Foundry VTT Discord Server](https://discord.gg/foundryvtt)
+ [Roll-Formulas](https://github.com/foundryvtt/dnd5e/wiki/Roll-Formulas)
+ [Module-Development](https://foundryvtt.com/article/module-development/)
+ [Foundry VTT Community Wiki](https://foundryvtt.wiki/en/home)
+ [Deleting Properties from Documents](https://discord.com/channels/170995199584108546/699750150674972743/1043341804742914141)
+ [Deleting Documents](https://github.com/GamerFlix/foundryvtt-api-guide/blob/main/macro_guide.md#deleting-documents)
+ [Font-Awesome](https://fontawesome.com/search?m=free&o=r)



# Dependencies

## System

| Key | Value |
| --------------- | ---------------  |
| `title` | `Eclipse Phase 2e` |
| `id` | `eclipsephase` |
| `download` | `https://github.com/DerDiemen/eclipsephase/archive/v0.9.8/eclipsephase-0.9.8.zip` |
| `manifest` | `https://github.com/DerDiemen/eclipsephase2e-foundryVTT/raw/v0.9.8/system.json` |
| `url` | `https://github.com/DerDiemen/eclipsephase` |

[Project-URL](https://github.com/DerDiemen/eclipsephase)


## Modules

## Modules Active

`game.modules.filter(m => m.active)` (might not order alphabetically, `id` is probably key for ordering while `title` is what we use). This list can be updated [by Macro](https://github.com/itteerde/fvttconfig/blob/main/tools/macros/dev/listModules.js). This list is supposed to be to real Production list. There might be a bit of a gap during preparing the next update. Maybe in the future it should reflect the accpeted list instead, which would mean it is either Production or what production is supposed to catch up soon, with the list already being somewhat approved.


1. Autocomplete Whisper (version: 1.0.5) : [Project-URL](https://github.com/orcnog/autocomplete-whisper/), [Manifest](https://raw.githubusercontent.com/orcnog/autocomplete-whisper/master/module.json)
1. Dice Tray (version: 1.5.3) : [Project-URL](https://gitlab.com/asacolips-projects/foundry-mods/foundry-vtt-dice-calculator), [Manifest](https://gitlab.com/asacolips-projects/foundry-mods/foundry-vtt-dice-calculator/raw/master/module.json)
1. ep2e - Tablerules (version: 0.0.1) : [Project-URL](https://github.com/itteerde/ep2eFVTT/), [Manifest](https://raw.githubusercontent.com/itteerde/ep2eFVTT/main/ep2e-tr/module.json)
