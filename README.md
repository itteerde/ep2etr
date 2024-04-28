# ep2eFVTT
Eclipse Phase 2nd Edition Foundry VTT -- Tablerules and Configuration Module



# Documentation

## General

+ [Foundry Virtual Tabletop - API Documentation - Version 11](https://foundryvtt.com/api/)
+ [Foundry VTT Discord Server](https://discord.gg/foundryvtt)
+ [Module-Development](https://foundryvtt.com/article/module-development/)
+ [Foundry VTT Community Wiki](https://foundryvtt.wiki/en/home)
+ [Deleting Properties from Documents](https://discord.com/channels/170995199584108546/699750150674972743/1043341804742914141)
+ [Deleting Documents](https://github.com/GamerFlix/foundryvtt-api-guide/blob/main/macro_guide.md#deleting-documents)



# Dependencies

## System

- `title`: Eclipse Phase 2e
- `id`: ep2e
- `download`: [Download-URL](ep2e)
- `manifest`: [Manifest-URL](https://github.com/Bubz43/ep2e/releases/latest/download/system.json)
- `url`: [Project-URL](https://github.com/Bubz43/ep2e)

## Modules

## Modules Active

`game.modules.filter(m => m.active)` (might not order alphabetically, `id` is probably key for ordering while `title` is what we use). This list can be updated [by Macro](https://github.com/itteerde/fvttconfig/blob/main/tools/macros/dev/listModules.js). This list is supposed to be to real Production list. There might be a bit of a gap during preparing the next update. Maybe in the future it should reflect the accpeted list instead, which would mean it is either Production or what production is supposed to catch up soon, with the list already being somewhat approved.

1. Autocomplete Whisper (version: 1.0.5) : [Project-URL](https://github.com/orcnog/autocomplete-whisper/), [Manifest](https://raw.githubusercontent.com/orcnog/autocomplete-whisper/master/module.json)
1. ep2edavemaps (version: 1.0.0) : [Project-URL](undefined), [Manifest](undefined)
1. FXMaster (version: 4.0.2) : [Project-URL](https://github.com/ghost-fvtt/fxmaster), [Manifest](https://github.com/ghost-fvtt/fxmaster/releases/latest/download/module.json)
1. libWrapper (version: 1.12.13.0) : [Project-URL](https://github.com/ruipin/fvtt-lib-wrapper), [Manifest](https://github.com/ruipin/fvtt-lib-wrapper/releases/latest/download/module.json)
1. PopOut! (version: 2.16) : [Project-URL](https://github.com/League-of-Foundry-Developers/fvtt-module-popout), [Manifest](https://raw.githubusercontent.com/League-of-Foundry-Developers/fvtt-module-popout/master/module.json)
1. ep2e - Tablerules (version: 0.0.1) : [Project-URL](https://github.com/itteerde/ep2etr/), [Manifest](https://raw.githubusercontent.com/itteerde/ep2etr/main/ep2e-tr/module.json)